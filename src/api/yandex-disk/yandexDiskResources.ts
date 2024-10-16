import { AxiosInstance } from 'axios';
import YandexDiskClient from './yandexDiskClient';
import axios from 'axios';
import * as stream from 'stream';
import { promisify } from 'util';

class YandexDiskResources {
  private static readonly RESOURCES_ENDPOINT = '/resources';
  private static readonly UPLOAD_ACTION = '/upload';

  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  public async createDirectory(path: string, ignoreErrorCodes: number[] = []): Promise<void> {
    const parts = path.split('/').filter(part => part.length > 0);
    let currentPath = '';
  
    for (const part of parts) {
      currentPath += `/${part}`;
      const endpoint = `${YandexDiskClient.BASE_URL}${YandexDiskResources.RESOURCES_ENDPOINT}?path=${encodeURIComponent(currentPath)}`;
      try {
        console.log(`[YandexDiskResources.createDirectory] Creating directory at ${currentPath}`);
        await this.client.put(endpoint);
        console.log(`[YandexDiskResources.createDirectory] Successfully created directory at ${currentPath}`);
      } catch (error: any) {
        const errorCode = error.response.status
        if (ignoreErrorCodes.includes(errorCode)) {
          console.warn(`[YandexDiskResources.createDirectory] Error creating directory at ${currentPath}: ${error}. Ignoring ${errorCode} code`);
        } else {
          console.error(`[YandexDiskResources.createDirectory] Error creating directory at ${currentPath}: ${error}`);
          throw error;
        }
      }
    }
  }

  public async getDirectoryContents(payload: { path: string; limit?: number; offset?: number }): Promise<any> {
    const endpoint = `${YandexDiskClient.BASE_URL}${YandexDiskResources.RESOURCES_ENDPOINT}`;
    
    try {
      console.log(`[YandexDiskResources.getDirectoryContents] Fetching contents of directory at ${payload.path}`);
      const { data } = await this.client.get(endpoint, {
        params: {
          path: payload.path,
          limit: payload.limit || 1000,
          offset: payload.offset || 0,
        },
      });
      console.log(`[YandexDiskResources.getDirectoryContents] Successfully fetched contents of directory at ${payload.path}`);
      return data;
    } catch (error) {
      console.error(`[YandexDiskResources.getDirectoryContents] Error fetching directory contents at ${payload.path}: ${error}`);
      throw error;
    }
  }

  public async removeDirectory(payload: { path: string; permanently?: boolean; forceAsync?: boolean }, ignoreErrorCodes: number[] = []): Promise<void> {
    const endpoint = `${YandexDiskClient.BASE_URL}${YandexDiskResources.RESOURCES_ENDPOINT}?path=${encodeURIComponent(payload.path)}`;
    try {
      console.log(`[YandexDiskResources.removeDirectory] Removing directory at ${payload.path}`);
      await this.client.delete(endpoint, {
        params: {
          permanently: payload.permanently || false,
          force_async: payload.forceAsync || false,
        },
      });
      console.log(`[YandexDiskResources.removeDirectory] Successfully removed directory at ${payload.path}`);
    } catch (error: any) {
      const errorCode = error.response.status
      if (ignoreErrorCodes.includes(errorCode)) {
        console.warn(`[YandexDiskResources.removeDirectory] Error removing directory at ${payload.path}: ${error}. Ignoring ${errorCode} code`);
      } else {
        console.error(`[YandexDiskResources.removeDirectory] Error removing directory at ${payload.path}: ${error}`);
        throw error;
      }
    }
  }

  public async uploadResource(payload: { path: string; url: string; overwrite?: boolean }): Promise<any> {
    try {
      const directoryPath = payload.path.split('/').slice(0, -1).join('/');
      if (directoryPath) {
        await this.createDirectory(directoryPath, [409]);
      }
      const uploadUrlEndpoint = `${YandexDiskClient.BASE_URL}${YandexDiskResources.RESOURCES_ENDPOINT}${YandexDiskResources.UPLOAD_ACTION}`;
      const { data: uploadUrlData } = await this.client.get(uploadUrlEndpoint, {
        params: {
          path: payload.path,
          overwrite: payload.overwrite || false,
        },
      });
      const imageResponse = await axios.get(payload.url, { responseType: 'stream' });
      const finished = promisify(stream.finished);
      const uploadStream = await axios({
        method: 'put',
        url: uploadUrlData.href,
        data: imageResponse.data,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      await finished(imageResponse.data);

      console.log(`[YandexDiskResources.uploadResource] Successfully uploaded resource to ${payload.path}`);
      return uploadStream.data;
    } catch (error) {
      console.error(`[YandexDiskResources.uploadResource] Error uploading resource to ${payload.path}: ${error}`);
      throw error;
    }
  }
}

export default YandexDiskResources;
