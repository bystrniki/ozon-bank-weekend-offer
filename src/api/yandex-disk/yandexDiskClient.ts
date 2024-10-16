import axios, { AxiosInstance } from 'axios';

class YandexDiskClient {
  public static readonly BASE_URL = 'https://cloud-api.yandex.net/v1/disk';
  private static readonly TOKEN_ENV_VAR = 'YANDEX_DISK_POLYGON_OAUTH_TOKEN';

  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: YandexDiskClient.BASE_URL,
      headers: {
        Authorization: `OAuth ${process.env[YandexDiskClient.TOKEN_ENV_VAR]}`,
        'Content-Type': 'application/json',
      },
    });
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export default YandexDiskClient;
