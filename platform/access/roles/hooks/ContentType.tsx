import { AwxContentType } from '@ansible/awx-ui/access/roles/hooks/AwxContentType';
import { SharedContentType } from '@ansible/common-ui/access/roles/SharedContentType';
import { EdaContentType } from '@ansible/eda-ui/access/roles/hooks/EdaContentType';
import { HubContentType } from '@ansible/hub-ui/access/roles/hooks/HubContentType';

/**
 * ContentType represents all the content types across the platform.
 * It includes shared content types as well as specific content types from AWX, EDA, and Hub.
 */
export type ContentType = SharedContentType | AwxContentType | EdaContentType | HubContentType;
