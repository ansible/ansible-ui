import { validateUrlPath } from './validateUrlPath';

describe('validateUrlPath', () => {
  it('should return null if no path given', () => {
    expect(validateUrlPath(null)).to.be.null;
  });

  it('should return valid path', () => {
    expect(validateUrlPath('/foo/bar')).to.equal('/foo/bar');
    expect(validateUrlPath('/foo')).to.equal('/foo');
    expect(validateUrlPath('/')).to.equal('/');
    expect(validateUrlPath('/foo-bar/baz/')).to.equal('/foo-bar/baz/');
    expect(validateUrlPath('/foo/bar_baz/')).to.equal('/foo/bar_baz/');
  });

  it('should return valid path with query params', () => {
    expect(validateUrlPath('/foo/bar?page=3')).to.equal('/foo/bar?page=3');
    expect(validateUrlPath('/foo/bar?page=2&order_by=name')).to.equal(
      '/foo/bar?page=2&order_by=name'
    );
  });

  it('should return null for path not beginning with slash', () => {
    expect(validateUrlPath('incomplete/path')).to.be.null;
  });

  it('should return null for invalid path', () => {
    expect(validateUrlPath('not-a-path')).to.be.null;
    expect(validateUrlPath('javascript:alert("foo")')).to.be.null;
  });

  it('should return null for fully qualified url', () => {
    expect(validateUrlPath('https://example.com')).to.be.null;
    expect(validateUrlPath('https://example.com/foo')).to.be.null;
    expect(validateUrlPath('https://example.com/foo?bar=baz')).to.be.null;
  });
});
