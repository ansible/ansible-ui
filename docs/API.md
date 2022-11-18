## Functions

<dl>
<dt><a href="#BulkActionDialog">BulkActionDialog(title, items, keyFn, actionColumns)</a></dt>
<dd><p>BulkActionDialog</p></dd>
<dt><a href="#PageHeader">PageHeader(breadcrumbs, title, titleHelpTitle, titleHelp, description, controls, headerActions)</a></dt>
<dd><p>PageHeader enables the responsive layout of the header.</p></dd>
<dt><a href="#PageLayout">PageLayout()</a></dt>
<dd><p>PageLayout enables the layout of the page to be responsive.</p></dd>
<dt><a href="#useBreakpoint">useBreakpoint()</a></dt>
<dd><p>Returns true if the window size is equal to or larger than the indicated size.</p></dd>
</dl>

<a name="BulkActionDialog"></a>

## BulkActionDialog(title, items, keyFn, actionColumns)
<p>BulkActionDialog</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | <p>The title of the model.</p> |
| items | <code>Array(T)</code> | <p>The items to confirm for the bulk action.</p> |
| keyFn | <code>function</code> | <p>A function that gets a unique key for each item.</p> |
| actionColumns | <code>Array(ITableColumn&lt;T&gt;)</code> | <p>The columns to display when processing the actions.</p> |

<a name="PageHeader"></a>

## PageHeader(breadcrumbs, title, titleHelpTitle, titleHelp, description, controls, headerActions)
<p>PageHeader enables the responsive layout of the header.</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| breadcrumbs | <code>Array.&lt;Breadcrumb&gt;</code> | <p>The breadcrumbs for the page.</p> |
| title | <code>string</code> | <p>The title of the page.</p> |
| titleHelpTitle | <code>string</code> | <p>The title of help popover.</p> |
| titleHelp | <code>ReactNode</code> | <p>The content for the help popover.</p> |
| description | <code>string</code> | <p>The description of the page.</p> |
| controls | <code>ReactNode</code> | <p>Support for extra page controls.</p> |
| headerActions | <code>ReactNode</code> | <p>The actions for the page.</p> |

**Example**  
```js
<Page>
  <PageLayout>
    <PageHeader
      breadcrumbs={[{ label: 'Home', to: '/home' }, { label: 'Page title' }]}
      title='Page title'
      description='Page description'
      headerActions={<PageActions actions={actions} />}
    />
    <PageBody />...</PageBody>
  </PageLayout>
<Page>
```
<a name="PageLayout"></a>

## PageLayout()
<p>PageLayout enables the layout of the page to be responsive.</p>

**Kind**: global function  
**Example**  
```js
<Page>
  <PageLayout>
    <PageHeader />
    <PageBody />...</PageBody>
  </PageLayout>
<Page>
```
<a name="useBreakpoint"></a>

## useBreakpoint()
<p>Returns true if the window size is equal to or larger than the indicated size.</p>

**Kind**: global function  
