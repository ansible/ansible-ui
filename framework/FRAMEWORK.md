
# Framework

A framework for creating performant, consistent, and responsive web applications using [PatternFly](https://www.patternfly.org).

The framework is made up of high level components using PatternFly components underneath.
This allows the framework to adjust the web application for responsive layout.
Basic structure of the framework can be seen in the tree below.

- [PageLayout](#pagelayout)
  - [PageHeader](#pageheader)
  - [PageBody](#pagebody)
    - [PageTable](#pagetable)
    - [PageTabs](#pagetabs)
      - [PageTab](#pagetab)
    - [PageDetails](#pagedetails)
      - [PageDetail](#pagedetail)
    - [PageCatalog](#pagecatalog)
      - [PageCatalogCard](#pagecatalogcard)
    - [PageDashboard](#pagedashboard)
      - [PageDashboardCard](#pagedashboardcard)
      - [PageDashboardDonut](#pagedashboarddonut)
      - [PageDashboardChart](#pagedashboardchart)
    - [PageWizard](#pagewizard)
      - [PageWizardStep](#pagewizardstep)
    - [PageForm](#pageform)
      - [PageFormSection](#pageformsection)
        - [PageFormTextInput](#pageformtextinput)
        - [PageFormTextArea](#pageformtextarea)
        - [PageFormSelect](#pageformselect)
        - [PageFormMultiSelect](#pageformmultiselect)
        - [PageFormCheckbox](#pageformcheckbox)
        - [PageFormRadioGroup](#pageformradiogroup)

## PageLayout

The PageLayout is used at the start of each page. It provides a consistent layout of header elements. It supports responsive layout based on the size of the window.

```tsx
(
<Page>
  <PageLayout>
    <PageHeader {...}/>
    <PageBody {...}/>
  </PageLayout>
</Page>
)
```

### PageHeader

The PageHeader is used at the start of each page. It provides a consistent layout of header elements. It supports responsive layout based on the size of the window.

```tsx
(
<Page>
  <PageHeader 
    breadcrumbs={breadcrumbs}
    title="Page title"
    titleHelp="Page title popover description."
    description="Page description"
    actions={actions}
  />
</Page>
)
```

|       Property | Description                                                                |
| -------------: | -------------------------------------------------------------------------- |
|    breadcrumbs | The breadcrumbs for the page.                                              |
|          title | The title of the page.                                                     |
|      titleHelp | The help for the title popover.                                            |
| titleHelpTitle | The title of help popover.                                                 |
|    description | The description of the page.                                               |
|        actions | The actions for the page. Actions are used on details pages.               |
|       controls | Support for extra page controls that show up at the top right of the page. |

### PageBody

#### PageTable

#### PageTabs

```tsx
(
<Page>
  <PageHeader ... />
  <PageTabs alerts={alerts} loading={loading}>
    <PageTab title="Tab title" alerts={alerts}>
      ...
    </PageTab>
    <PageTab title="Tab title" alerts={alerts}>
      ...
    </PageTab>
  </PageTabs>
</Page>
)
```

##### PageTab

#### PageDetails

##### PageDetail

#### PageCatalog

##### PageCatalogCard

#### PageDashboard

##### PageDashboardCard

##### PageDashboardDonut

##### PageDashboardChart

#### PageWizard

##### PageWizardStep

#### PageForm

##### PageFormSection

###### PageFormTextInput

###### PageFormTextArea

###### PageFormSelect

###### PageFormMultiSelect

###### PageFormCheckbox

###### PageFormRadioGroup
