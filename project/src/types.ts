export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Product {
  name: string;
  price: string;
  category: string;
  description: string;
}