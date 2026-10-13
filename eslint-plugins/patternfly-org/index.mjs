const RAW_TEXT_ELEMENTS = new Set(['span', 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const RAW_LIST_ELEMENTS = new Set(['ul', 'ol', 'li']);
const TEXT_STYLE_PROPERTIES = new Set([
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'textDecoration',
  'textIndent',
  'textOverflow',
  'textShadow',
  'textTransform',
  'verticalAlign',
  'whiteSpace',
  'wordBreak',
  'wordSpacing',
  'wordWrap',
]);
const EXPRESSION_TYPES_THAT_MAY_CARRY_TEXT = new Set([
  'Identifier',
  'CallExpression',
  'MemberExpression',
  'ConditionalExpression',
  'LogicalExpression',
  'BinaryExpression',
  'ChainExpression',
]);

function isNativeTag(node, tags) {
  return node.name.type === 'JSXIdentifier' && tags.has(node.name.name);
}

function hasTextChild(child) {
  if (child.type === 'JSXText') return child.value.trim().length > 0;
  if (child.type !== 'JSXExpressionContainer') return false;
  return (
    (child.expression.type === 'Literal' && typeof child.expression.value === 'string') ||
    child.expression.type === 'TemplateLiteral' ||
    EXPRESSION_TYPES_THAT_MAY_CARRY_TEXT.has(child.expression.type)
  );
}

function isReactChildrenExpression(expression) {
  return (
    (expression.type === 'Identifier' && expression.name === 'children') ||
    (expression.type === 'MemberExpression' &&
      expression.object.type === 'Identifier' &&
      expression.object.name === 'props' &&
      expression.property.type === 'Identifier' &&
      expression.property.name === 'children')
  );
}

function isDynamicTextChild(child) {
  return (
    child.type === 'JSXExpressionContainer' &&
    EXPRESSION_TYPES_THAT_MAY_CARRY_TEXT.has(child.expression.type)
  );
}

function allDynamicChildrenAreReactChildren(children) {
  const dynamicChildren = children.filter(isDynamicTextChild);
  return (
    dynamicChildren.length > 0 &&
    dynamicChildren.every((child) => isReactChildrenExpression(child.expression))
  );
}

function hasTextStyle(openingElement) {
  const style = openingElement.attributes.find(
    (attribute) => attribute.type === 'JSXAttribute' && attribute.name.name === 'style'
  );
  if (!style || !style.value) return true;
  const expression =
    style.value.type === 'JSXExpressionContainer' ? style.value.expression : style.value;
  if (expression.type !== 'ObjectExpression') return true;
  if (expression.properties.some((property) => property.type === 'SpreadElement')) return true;
  return expression.properties.some(
    (property) =>
      property.type === 'Property' &&
      property.key.type === 'Identifier' &&
      TEXT_STYLE_PROPERTIES.has(property.key.name)
  );
}

function hasStyle(openingElement) {
  return openingElement.attributes.some(
    (attribute) => attribute.type === 'JSXAttribute' && attribute.name.name === 'style'
  );
}

function isScreenReaderSpan(openingElement) {
  return openingElement.attributes.some((attribute) => {
    if (attribute.type !== 'JSXAttribute' || attribute.name.name !== 'className') return false;
    return (
      attribute.value?.type === 'Literal' &&
      typeof attribute.value.value === 'string' &&
      attribute.value.value.split(' ').includes('pf-v6-u-screen-reader')
    );
  });
}

function isInsideTableCell(node) {
  let current = node.parent;
  while (current) {
    if (current.type === 'JSXElement' && current.openingElement.name.type === 'JSXIdentifier') {
      if (current.openingElement.name.name === 'Th' || current.openingElement.name.name === 'Td')
        return true;
    }
    current = current.parent;
  }
  return false;
}

const preferPfTextComponents = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer PatternFly text components over raw text elements.' },
    messages: {
      preferPfText: 'Prefer PatternFly text components instead of raw <{{element}}>.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (!isNativeTag(node, RAW_TEXT_ELEMENTS)) return;
        const element = node.parent;
        if (!element || element.type !== 'JSXElement') return;
        const children = element.children;
        const hasLiteralText = children.some(
          (child) =>
            (child.type === 'JSXText' && child.value.trim().length > 0) ||
            (child.type === 'JSXExpressionContainer' &&
              ((child.expression.type === 'Literal' &&
                typeof child.expression.value === 'string') ||
                child.expression.type === 'TemplateLiteral'))
        );
        const hasText = children.some(hasTextChild);
        const styled = hasStyle(node);
        const tag = node.name.name;

        if ((tag === 'p' || /^h[1-6]$/.test(tag)) && hasText) {
          context.report({ node, messageId: 'preferPfText', data: { element: tag } });
          return;
        }
        if (!hasText || (tag === 'div' && !styled)) return;
        if (!hasLiteralText && allDynamicChildrenAreReactChildren(children)) return;
        if (tag === 'span' && isScreenReaderSpan(node)) return;
        if (
          tag === 'span' &&
          children
            .filter((child) => child.type !== 'JSXText' || child.value.trim())
            .every((child) => child.type === 'JSXElement')
        )
          return;
        if (isInsideTableCell(element) && !styled) return;
        if (styled && !hasTextStyle(node)) return;
        context.report({ node, messageId: 'preferPfText', data: { element: tag } });
      },
    };
  },
};

const preferPfListComponents = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Prefer PatternFly List and ListItem over native lists.' },
    messages: { preferPfList: 'Prefer PatternFly List and ListItem instead of raw <{{element}}>.' },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (isNativeTag(node, RAW_LIST_ELEMENTS)) {
          context.report({ node, messageId: 'preferPfList', data: { element: node.name.name } });
        }
      },
    };
  },
};

export default {
  rules: {
    'prefer-pf-text-components': preferPfTextComponents,
    'prefer-pf-list-components': preferPfListComponents,
  },
};
