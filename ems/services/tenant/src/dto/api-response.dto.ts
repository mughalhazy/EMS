export interface ApiMetaDto {
  requestId: string;
  timestamp: string;
}

export interface ApiDataResponseDto<T> {
  data: T;
  meta: ApiMetaDto;
}
