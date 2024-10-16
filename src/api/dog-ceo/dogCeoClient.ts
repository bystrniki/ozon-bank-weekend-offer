import axios, { AxiosInstance } from 'axios';

class DogCeoClient {
  private static readonly BASE_URL = 'https://dog.ceo/api';
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: DogCeoClient.BASE_URL,
    });
  }

  public async getSubBreeds(breed: string): Promise<string[]> {
    try {
      const { data } = await this.client.get(`/breed/${breed}/list`);
      return data.message;
    } catch (error) {
      console.error(`[DogCeoClient.getSubBreeds] Error fetching sub-breeds for ${breed}: ${error}`);
      return [];
    }
  }

  public async getRandomImage(breed: string): Promise<string> {
    try {
      const { data } = await this.client.get(`/breed/${breed}/images/random`);
      return data.message;
    } catch (error) {
      console.error(`[DogCeoClient.getRandomImage] Error fetching random image for ${breed}: ${error}`);
      throw error;
    }
  }
}

export default DogCeoClient;
