/**
 * tsx_parser.js - Parses React Native .tsx files into analyzable structure
 * Save as: accessibility_checker/tsx_parser.js
 */

const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

class ComponentNode {
  /**
   * Represents one React Native component (View, Button, TouchableOpacity, etc.)
   */
  constructor(type, props, loc) {
    this.type = type;           // e.g., "Button", "TouchableOpacity", "Text"
    this.props = props;         // e.g., { accessibilityLabel: "Submit" }
    this.children = [];         // Nested components
    this.location = loc;        // Line number in file
  }

  toString() {
    const propsStr = Object.keys(this.props).length > 0 
      ? ` props={${Object.keys(this.props).join(', ')}}`
      : '';
    return `<${this.type}${propsStr}> at line ${this.location.start.line}`;
  }
}

class TSXParser {
  constructor(filePath) {
    this.filePath = filePath;
    this.fileContent = fs.readFileSync(filePath, 'utf-8');
    this.components = [];
  }

  parse() {
    console.log(`📄 Parsing ${this.filePath}...\n`);

    // Parse TypeScript/JSX into Abstract Syntax Tree
    const ast = parser.parse(this.fileContent, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    });

    // Traverse the AST and extract React components
    traverse(ast, {
      JSXElement: (path) => {
        this.extractComponent(path.node);
      }
    });

    console.log(`✅ Found ${this.components.length} components\n`);
    return this.components;
  }

  extractComponent(node) {
    // Get component name (e.g., "Button", "View", "TouchableOpacity")
    const componentType = this.getComponentName(node.openingElement);
    
    // Extract props
    const props = this.extractProps(node.openingElement.attributes);
    
    // Get location (line number)
    const location = node.loc;

    const component = new ComponentNode(componentType, props, location);
    
    // Extract children (nested components)
    node.children.forEach(child => {
      if (child.type === 'JSXElement') {
        component.children.push(this.extractComponent(child));
      }
    });

    this.components.push(component);
    return component;
  }

  getComponentName(openingElement) {
    const name = openingElement.name;
    
    // Handle different JSX name types
    if (name.type === 'JSXIdentifier') {
      return name.name;
    } else if (name.type === 'JSXMemberExpression') {
      // e.g., Animated.View
      return `${name.object.name}.${name.property.name}`;
    }
    
    return 'Unknown';
  }

  extractProps(attributes) {
    const props = {};
    
    attributes.forEach(attr => {
      if (attr.type !== 'JSXAttribute') return;
      
      const propName = attr.name.name;
      let propValue = null;

      // Extract prop value
      if (attr.value) {
        if (attr.value.type === 'StringLiteral') {
          propValue = attr.value.value;
        } else if (attr.value.type === 'JSXExpressionContainer') {
          // Handle expressions like {true}, {handlePress}, etc.
          const expr = attr.value.expression;
          
          if (expr.type === 'BooleanLiteral') {
            propValue = expr.value;
          } else if (expr.type === 'NumericLiteral') {
            propValue = expr.value;
          } else if (expr.type === 'StringLiteral') {
            propValue = expr.value;
          } else if (expr.type === 'ObjectExpression') {
            // Style objects
            propValue = '{...}';
          } else {
            propValue = `{${this.fileContent.substring(expr.start, expr.end)}}`;
          }
        }
      } else {
        // Boolean prop without value (e.g., accessible)
        propValue = true;
      }

      props[propName] = propValue;
    });

    return props;
  }

  printComponents() {
    console.log('📦 Component Tree:\n');
    this.components.forEach((comp, idx) => {
      this.printComponent(comp, 0, idx + 1);
    });
  }

  printComponent(comp, indent, index) {
    const indentStr = '  '.repeat(indent);
    console.log(`${indentStr}${index}. ${comp.type} (line ${comp.location.start.line})`);
    
    // Show important props
    const importantProps = ['accessibilityLabel', 'accessibilityHint', 'accessible', 
                           'accessibilityRole', 'onPress', 'style'];
    
    Object.keys(comp.props).forEach(key => {
      if (importantProps.includes(key)) {
        console.log(`${indentStr}   └─ ${key}: ${comp.props[key]}`);
      }
    });

    // Print children
    comp.children.forEach((child, idx) => {
      this.printComponent(child, indent + 1, idx + 1);
    });
  }
}

module.exports = TSXParser;

// Quick test
if (require.main === module) {
  console.log('This is the TSX Parser module!');
  console.log('Import it in check_component.js instead of running directly');
}