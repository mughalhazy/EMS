export class CreateRoomDto {
  name!: string;
  floor?: string | null;
  capacity!: number;
}
