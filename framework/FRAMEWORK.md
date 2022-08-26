
# Page Framework

A framework for creating performant, consistent, and responsive web applications using [PatternFly](https://www.patternfly.org).

- [PageLayout](#pagelayout)
  - [PageHeader](#pageheader)
    - [PageBreadcrumbs](#pagebreadcrumbs)
      - [PageBreadcrumb](#pagebreadcrumb)
    - [PageTitle](#pagetitle)
      - [PageTitleHelp](#pagetitlehelp)
    - [PageDescription](#pagedescription)
    - [PageActions](#pageactions)
      - [PageAction](#pageaction)
    - [PageControls](#pagecontrols)
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
|        loading | Indicates if the header is loading. Adds a skeleton state.                 |

#### PageBreadcrumbs

##### PageBreadcrumb

#### PageTitle

##### PageTitleHelp

#### PageDescription

#### PageActions

##### PageAction

#### PageControls

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
