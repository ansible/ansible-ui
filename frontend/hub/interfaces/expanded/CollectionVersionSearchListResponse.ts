import '../generated/CollectionVersionSearchListResponse';

declare module '../generated/CollectionVersionSearchListResponse' {
  interface CollectionVersionSearchListResponse {
    namespace_metadata?: {
      pulp_href: string;
      name: string;
      company: string;
      description: string;
      avatar_url: string;
    };
  }
}
