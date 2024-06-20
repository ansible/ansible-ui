## PageCarousel

The PageCarousel component displays child components (cards) within it and enables switching between pages of cards using a smooth swipe-style animation. 
The navigation elements comprise of previous and next arrow buttons surrounding one or more
interactable dots where each dot represents a specific page. 
The PageCarousel component is responsive and the number of cards displayed within it adjust with the screen size.

```tsx
<PageCarousel>
  <Card isFlat>
    <CardBody>Card 1</CardBody>
  </Card>
  <Card isRounded isFlat>
    <CardBody>Card 2</CardBody>
  </Card>
  <Card isRounded isFlat>
    <CardBody>Card 3</CardBody>
  </Card>
</PageCarousel>
```

| Prop  | Type     | Description
| ----- | -------- | -----------
| carouselId | `string` | A unique ID to distinguish between multiple carousels on a page


## PageDashboardCarousel

If the carousel component is being utilized in the context of a page dashboard, the wrapper component `PageDashboardCarousel` can be utilized. The `PageDashboardCarousel` accepts a title, link and width and displays the underlying child components in a carousel within a `PageDashboardCard`.

```tsx
<PageDashboardCarousel
  title="Featured Collections"
  linkText="Go to Collections"
  to="/hub/collections"
  width="xxl"
>
  <Card isFlat>
    <CardBody>Card 1</CardBody>
  </Card>
  <Card isRounded isFlat>
    <CardBody>Card 2</CardBody>
  </Card>
  <Card isRounded isFlat>
    <CardBody>Card 3</CardBody>
  </Card>
  <Card isRounded isFlat>
    <CardBody>Card 4</CardBody>
  </Card>
  <Card isRounded isFlat>
    <CardBody>Card 5</CardBody>
  </Card>
</PageDashboardCarousel>
```

| Prop  | Type     | Description
| ----- | -------- | -----------
| title | `string` | A title for the PageDashBoardCard within which the carousel appears
| linkText? | `string` | Text for link that shows up in the top right corner of the card
| to? | `string` | Route to link the `linkText` to
| width | `PageDashboardCardWidth` | Width of `PageDashBoardCard` (options are 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl')

### Example

![image](https://github.com/ansible/ansible-ui/assets/43621546/137d8bc9-9e54-4d3c-9e69-57dfa970dbf9)
