export interface CategoryBase {
  name: string;
  description?: string;
  parent_id?: number;
}

export interface CategoryResponse extends CategoryBase {
  id: number;
  level: number;
} 