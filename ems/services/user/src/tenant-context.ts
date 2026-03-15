import { AsyncLocalStorage } from 'node:async_hooks';

interface TenantRequestContext {
  tenantId: string;
}

const tenantContextStorage = new AsyncLocalStorage<TenantRequestContext>();

export class TenantContext {
  static run<T>(tenantId: string, callback: () => T): T {
    return tenantContextStorage.run({ tenantId }, callback);
  }

  static getTenantId(): string | undefined {
    return tenantContextStorage.getStore()?.tenantId;
  }
}
