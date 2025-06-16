// src/file-manager.ts
import { CloudflareService } from "./cloudflare.service";

export class FileManager {
  constructor(private readonly storage: CloudflareService) {}

  private getValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  }

  private setValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((acc, key) => {
      if (typeof acc[key] !== "object" || acc[key] === null) acc[key] = {};
      return acc[key];
    }, obj);
    target[lastKey] = value;
  }

  private getValueWithUrl(obj: any, path: string): any {
    return path.split(".").reduce((o, key) => (o ? o[key] : undefined), obj);
  }

  private setValueWithUrl(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    const lastKey = keys[keys.length - 1];
    const urlKey = `${lastKey}_url`;
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[urlKey] = value;
  }

  async appendFileUrls<T extends Record<string, any>>(
    items: T | T[],
    fields: string[]
  ): Promise<T | T[]> {
    const arrayMode = Array.isArray(items);
    const itemList = arrayMode ? items : [items];

    const result = await Promise.all(
      itemList.map(async (original) => {
        const item =
          typeof original.toObject === "function"
            ? original.toObject()
            : original;

        await Promise.all(
          fields.flatMap((fieldPath) => {
            if (!fieldPath.includes("[]")) {
              const key = this.getValueWithUrl(item, fieldPath);
              if (typeof key === "string" && key) {
                return [
                  (async () => {
                    const url = await this.storage.getDownloadUrl(key);
                    this.setValueWithUrl(item, fieldPath, url);
                  })(),
                ];
              }
              return [];
            }

            const [arrPath, ...rest] = fieldPath.split("[]");
            const arr = this.getValueWithUrl(item, arrPath);
            if (!Array.isArray(arr)) return [];

            const subPath = rest.join("").replace(/^\./, "");

            return arr.flatMap((_el, i) => {
              const full = `${arrPath}.${i}.${subPath}`;
              const val = this.getValueWithUrl(item, full);
              if (typeof val === "string" && val) {
                return [
                  (async () => {
                    const url = await this.storage.getDownloadUrl(val);
                    this.setValueWithUrl(item, full, url);
                  })(),
                ];
              }
              return [];
            });
          })
        );

        return item;
      })
    );

    return arrayMode ? result : result[0];
  }

  async createFilesFromPayload<T extends Record<string, any>>(
    input: T,
    fields: string[]
  ): Promise<{ updatedPayload: T; uploadUrls: Record<string, string> }> {
    const uploadUrls: Record<string, string> = {};
    const clone =
      typeof (input as any)?.toObject === "function" ? input.toObject() : input;

    await Promise.all(
      fields.flatMap((fieldPath) => {
        if (!fieldPath.includes("[]")) {
          const val = this.getValue(clone, fieldPath);
          if (val) {
            return [
              (async () => {
                const signed = await this.storage.getUploadUrl(val);
                this.setValue(input, fieldPath, signed.fileName);
                uploadUrls[fieldPath] = signed.uploadUrl;
              })(),
            ];
          }
          return [];
        }

        const [arrPath, ...rest] = fieldPath.split("[]");
        const arr = this.getValue(clone, arrPath);
        if (!Array.isArray(arr)) return [];

        const subPath = rest.join("").replace(/^\./, "");

        return arr.flatMap((_el, i) => {
          const full = `${arrPath}.${i}.${subPath}`;
          const val = this.getValue(clone, full);
          if (val) {
            return [
              (async () => {
                const signed = await this.storage.getUploadUrl(val);
                this.setValue(input, full, signed.fileName);
                uploadUrls[full] = signed.uploadUrl;
              })(),
            ];
          }
          return [];
        });
      })
    );

    return { updatedPayload: input, uploadUrls };
  }

  async updateFilesFromPayload<T extends Record<string, any>>(
    input: T,
    existing: Partial<T>,
    fields: string[]
  ): Promise<{ updatedPayload: T; uploadUrls: Record<string, string> }> {
    const uploadUrls: Record<string, string> = {};
    const newClone =
      typeof (input as any)?.toObject === "function" ? input.toObject() : input;
    const oldClone =
      typeof (existing as any)?.toObject === "function"
        ? (existing as any).toObject()
        : existing;

    for (const fieldPath of fields) {
      if (fieldPath.includes("[]")) {
        const [arrPath, subField] = fieldPath.split("[].");
        const arr = this.getValue(newClone, arrPath);

        if (Array.isArray(arr)) {
          for (let i = 0; i < arr.length; i++) {
            const full = `${arrPath}.${i}.${subField}`;
            const newVal = this.getValue(newClone, full);
            const oldVal = this.getValue(oldClone, full);

            if (typeof newVal === "string" && newVal && newVal !== oldVal) {
              const signed = await this.storage.getUploadUrl(newVal);
              this.setValue(input, full, signed.fileName);
              uploadUrls[full] = signed.uploadUrl;
              if (oldVal) await this.storage.deleteFile(oldVal);
            } else if (typeof newVal === "string" && newVal === "" && oldVal) {
              await this.storage.deleteFile(oldVal);
              this.setValue(input, full, "");
            }
          }
        }
      } else {
        const newVal = this.getValue(newClone, fieldPath);
        const oldVal = this.getValue(oldClone, fieldPath);

        if (typeof newVal === "string" && newVal && newVal !== oldVal) {
          const signed = await this.storage.getUploadUrl(newVal);
          this.setValue(input, fieldPath, signed.fileName);
          uploadUrls[fieldPath] = signed.uploadUrl;
          if (oldVal) await this.storage.deleteFile(oldVal);
        } else if (typeof newVal === "string" && newVal === "" && oldVal) {
          await this.storage.deleteFile(oldVal);
          this.setValue(input, fieldPath, "");
        }
      }
    }

    return { updatedPayload: input, uploadUrls };
  }

  async deleteFilesFromPayload<T extends Record<string, any>>(
    item: T,
    fields: string[]
  ): Promise<void> {
    const cleanItem =
      typeof (item as any)?.toObject === "function" ? item.toObject() : item;

    await Promise.all(
      fields.map(async (fieldPath) => {
        if (fieldPath.includes("[]")) {
          const [arrPath, subField] = fieldPath.split("[].");
          const arr = this.getValue(cleanItem, arrPath);

          if (Array.isArray(arr)) {
            await Promise.all(
              arr.map(async (_: any, i: number) => {
                const full = `${arrPath}.${i}.${subField}`;
                const val = this.getValue(cleanItem, full);
                if (typeof val === "string" && val) {
                  await this.storage.deleteFile(val);
                }
              })
            );
          }
        } else {
          const val = this.getValue(cleanItem, fieldPath);
          if (typeof val === "string" && val) {
            await this.storage.deleteFile(val);
          }
        }
      })
    );
  }
}
