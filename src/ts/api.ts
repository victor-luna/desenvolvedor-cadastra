import { Product } from "./Product";

const serverUrl = "http://localhost:5000";

export async function getProducts(): Promise<Product[]> {
  try {
    const response: Response = await fetch(`${serverUrl}/products`);
    const products: Product[] = await response.json();
    console.log(products);
    return products;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
}
