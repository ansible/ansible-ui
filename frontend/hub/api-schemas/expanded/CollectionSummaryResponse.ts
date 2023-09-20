import '../generated/CollectionSummaryResponse';

declare module '../generated/CollectionSummaryResponse' {
  interface CollectionSummaryResponse {
    // A JSON field with data about the contents.
    contents?: ContentSummaryType[];
    tags?: {
      name: string;
    }[];
    // A dict declaring Collections that this collection requires to be installed for it to be usable.
    dependencies?: {
      [collection: string]: string;
    };
    require_ansible: string;
  }
}

interface ContentSummaryType {
  name: string;
  content_type: string;
  description: string;
}
