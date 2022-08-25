import { constants } from 'http2'

export const HTTP2_HEADER_AUTHORITY = constants.HTTP2_HEADER_AUTHORITY
export const HTTP2_HEADER_CONNECTION = constants.HTTP2_HEADER_CONNECTION
export const HTTP2_HEADER_CONTENT_LENGTH = constants.HTTP2_HEADER_CONTENT_LENGTH
export const HTTP2_HEADER_CONTENT_TYPE = constants.HTTP2_HEADER_CONTENT_TYPE
export const HTTP2_HEADER_HOST = constants.HTTP2_HEADER_HOST
export const HTTP2_HEADER_KEEP_ALIVE = constants.HTTP2_HEADER_KEEP_ALIVE
export const HTTP2_HEADER_PROXY_AUTHENTICATE = constants.HTTP2_HEADER_PROXY_AUTHENTICATE
export const HTTP2_HEADER_PROXY_AUTHORIZATION = constants.HTTP2_HEADER_PROXY_AUTHORIZATION
export const HTTP2_HEADER_REFERER = constants.HTTP2_HEADER_REFERER
export const HTTP2_HEADER_TE = constants.HTTP2_HEADER_TE
export const HTTP2_HEADER_TRANSFER_ENCODING = constants.HTTP2_HEADER_TRANSFER_ENCODING
export const HTTP2_HEADER_UPGRADE = constants.HTTP2_HEADER_UPGRADE
export const HTTP2_HEADER_LOCATION = constants.HTTP2_HEADER_LOCATION

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses

/** This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response. */
export const HTTP_STATUS_BAD_GATEWAY = constants.HTTP_STATUS_BAD_GATEWAY

/** The server has encountered a situation it does not know how to handle. */
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = constants.HTTP_STATUS_INTERNAL_SERVER_ERROR

/** The server can not find the requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 Forbidden to hide the existence of a resource from an unauthorized client. This response code is probably the most well known due to its frequent occurrence on the web. */
export const HTTP_STATUS_NOT_FOUND = constants.HTTP_STATUS_NOT_FOUND

/** The request succeeded. The result meaning of "success" depends on the HTTP method:
GET: The resource has been fetched and transmitted in the message body.
HEAD: The representation headers are included in the response without any message body.
PUT or POST: The resource describing the result of the action is transmitted in the message body.
TRACE: The message body contains the request message as received by the server. */
export const HTTP_STATUS_OK = constants.HTTP_STATUS_OK

/** The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded. Note that together with this response, a user-friendly page explaining the problem should be sent. This response should be used for temporary conditions and the Retry-After HTTP header should, if possible, contain the estimated time before the recovery of the service. The webmaster must also take care about the caching-related headers that are sent along with this response, as these temporary condition responses should usually not be cached. */
export const HTTP_STATUS_SERVICE_UNAVAILABLE = constants.HTTP_STATUS_SERVICE_UNAVAILABLE

export const HTTP_STATUS_TEMPORARY_REDIRECT = constants.HTTP_STATUS_TEMPORARY_REDIRECT

export const HTTP_STATUS_UNAUTHORIZED = constants.HTTP_STATUS_UNAUTHORIZED
