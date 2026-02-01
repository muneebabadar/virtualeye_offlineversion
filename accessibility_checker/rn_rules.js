// /**
//  * rn_rules.js - React Native accessibility rules checker
//  */

// const chalk = require('chalk');

// class Violation {
//   constructor(ruleName, component, message, fix, wcag, severity) {
//     this.ruleName = ruleName;
//     this.component = component;
//     this.message = message;
//     this.fix = fix;
//     this.wcag = wcag;
//     this.severity = severity; // CRITICAL, HIGH, MEDIUM
//   }

//   toString() {
//     const severityColors = {
//       CRITICAL: chalk.red,
//       HIGH: chalk.yellow,
//       MEDIUM: chalk.blue
//     };

//     const color = severityColors[this.severity] || chalk.white;
//     const emoji =
//       this.severity === 'CRITICAL' ? '🔴' :
//       this.severity === 'HIGH' ? '🟠' : '🟡';

//     return `
// ${emoji} ${color.bold(this.severity)} - ${this.ruleName}
//    Component: ${this.component}
//    Problem: ${this.message}
//    How to fix: ${chalk.green(this.fix)}
//    WCAG Rule: ${this.wcag}
// `;
//   }
// }

// class RNAccessibilityChecker {
//   constructor() {
//     this.violations = [];
//   }

//   check(components) {
//     console.log(chalk.blue('🔍 Checking React Native accessibility rules...\n'));

//     components.forEach(component => {
//       this.checkComponent(component);
//     });

//     console.log(
//       chalk.green(`✅ Check complete! Found ${this.violations.length} violations\n`)
//     );
//     return this.violations;
//   }

//   checkComponent(comp) {
//     this.checkTouchableLabel(comp);
//     this.checkImageAccessibility(comp);
//     this.checkTouchTargetSize(comp);
//     this.checkTextScalability(comp);
//     this.checkButtonAccessibility(comp);
//     this.checkAccessibleProp(comp);

//     // 🔥 Extended rules
//     this.checkMissingAccessibilityRole(comp);
//     this.checkTextWithOnPress(comp);
//     this.checkDisabledState(comp);
//     this.checkGenericAccessibilityLabel(comp);
//     this.checkInteractiveInsideInaccessibleParent(comp);

//     comp.children.forEach(child => {
//       child.__parent = comp;
//       this.checkComponent(child);
//     });
//   }

//   /* ===================== RULE 1 ===================== */
//   checkTouchableLabel(comp) {
//     const touchableTypes = [
//       'TouchableOpacity',
//       'TouchableHighlight',
//       'TouchableWithoutFeedback',
//       'Pressable'
//     ];

//     if (!touchableTypes.includes(comp.type)) return;

//     if (!comp.props.accessibilityLabel) {
//       this.violations.push(new Violation(
//         'Missing Accessibility Label',
//         comp.toString(),
//         'Touchable component has no accessibilityLabel',
//         `Add accessibilityLabel="Submit form"`,
//         'WCAG 4.1.2 Name, Role, Value (A)',
//         'CRITICAL'
//       ));
//     }
//   }

//   /* ===================== RULE 2 ===================== */
//   checkImageAccessibility(comp) {
//     if (comp.type !== 'Image') return;

//     const hasLabel = comp.props.accessibilityLabel;
//     const decorative = comp.props.accessible === false;

//     if (!hasLabel && !decorative) {
//       this.violations.push(new Violation(
//         'Image Missing Description',
//         comp.toString(),
//         'Image has no text alternative',
//         'Add accessibilityLabel or mark as decorative',
//         'WCAG 1.1.1 Non-text Content (A)',
//         'CRITICAL'
//       ));
//     }
//   }

//   /* ===================== RULE 3 ===================== */
//   checkTouchTargetSize(comp) {
//     const interactiveTypes = [
//       'TouchableOpacity', 'TouchableHighlight',
//       'Pressable', 'Button', 'Switch'
//     ];

//     if (!interactiveTypes.includes(comp.type)) return;

//     const style = comp.props.style;

//     if (typeof style === 'string' &&
//         (style.includes('width: 20') || style.includes('height: 20') ||
//          style.includes('width: 30') || style.includes('height: 30'))) {
//       this.violations.push(new Violation(
//         'Touch Target Too Small',
//         comp.toString(),
//         'Interactive element smaller than recommended size',
//         'Use minWidth/minHeight ≥ 44',
//         'WCAG 2.5.8 Target Size (AA)',
//         'CRITICAL'
//       ));
//     }
//   }

//   /* ===================== RULE 4 ===================== */
//   checkTextScalability(comp) {
//     if (comp.type !== 'Text') return;

//     if (comp.props.allowFontScaling === false) {
//       this.violations.push(new Violation(
//         'Text Scaling Disabled',
//         comp.toString(),
//         'Font scaling is disabled',
//         'Allow font scaling',
//         'WCAG 1.4.4 Resize Text (AA)',
//         'HIGH'
//       ));
//     }
//   }

//   /* ===================== RULE 5 ===================== */
//   checkButtonAccessibility(comp) {
//     if (comp.type !== 'Button') return;

//     if (!comp.props.title) {
//       this.violations.push(new Violation(
//         'Button Missing Title',
//         comp.toString(),
//         'Button lacks title',
//         'Add title prop',
//         'WCAG 4.1.2 Name, Role, Value (A)',
//         'CRITICAL'
//       ));
//     }
//   }

//   /* ===================== RULE 6 ===================== */
//   checkAccessibleProp(comp) {
//     const interactiveTypes = ['TouchableOpacity', 'TouchableHighlight', 'Pressable'];

//     if (!interactiveTypes.includes(comp.type)) return;

//     if (comp.props.accessible === false && !comp.props.accessibilityLabel) {
//       this.violations.push(new Violation(
//         'Element Hidden from Screen Reader',
//         comp.toString(),
//         'Interactive element marked inaccessible',
//         'Remove accessible={false}',
//         'Best Practice',
//         'MEDIUM'
//       ));
//     }
//   }

//   /* ===================== RULE 7 ===================== */
//   checkMissingAccessibilityRole(comp) {
//     const interactiveTypes = [
//       'TouchableOpacity', 'TouchableHighlight',
//       'TouchableWithoutFeedback', 'Pressable', 'Button'
//     ];

//     if (!interactiveTypes.includes(comp.type)) return;

//     if (!comp.props.accessibilityRole) {
//       this.violations.push(new Violation(
//         'Missing Accessibility Role',
//         comp.toString(),
//         'No accessibilityRole defined',
//         'Add accessibilityRole="button"',
//         'WCAG 4.1.2 Name, Role, Value (A)',
//         'HIGH'
//       ));
//     }
//   }

//   /* ===================== RULE 8 ===================== */
//   checkTextWithOnPress(comp) {
//     if (comp.type !== 'Text') return;

//     if (typeof comp.props.onPress === 'function' &&
//         !comp.props.accessibilityRole) {
//       this.violations.push(new Violation(
//         'Text Used as Button Without Role',
//         comp.toString(),
//         'Text is clickable but has no role',
//         'Add accessibilityRole="button"',
//         'WCAG 4.1.2 Name, Role, Value (A)',
//         'CRITICAL'
//       ));
//     }
//   }

//   /* ===================== RULE 9 ===================== */
//   checkDisabledState(comp) {
//     if (comp.props.disabled === true &&
//         comp.props.accessibilityState?.disabled !== true) {
//       this.violations.push(new Violation(
//         'Disabled State Not Announced',
//         comp.toString(),
//         'Disabled state not conveyed to screen reader',
//         'Add accessibilityState={{ disabled: true }}',
//         'WCAG 4.1.2 Name, Role, Value (A)',
//         'HIGH'
//       ));
//     }
//   }

//   /* ===================== RULE 10 ===================== */
//   checkGenericAccessibilityLabel(comp) {
//     const label = comp.props.accessibilityLabel;
//     if (!label) return;

//     const badLabels = ['button', 'icon', 'image', 'click here', 'tap here'];

//     if (badLabels.includes(label.toLowerCase().trim())) {
//       this.violations.push(new Violation(
//         'Generic Accessibility Label',
//         comp.toString(),
//         `Label "${label}" is not descriptive`,
//         'Use a meaningful label',
//         'WCAG 2.4.6 Headings and Labels (AA)',
//         'MEDIUM'
//       ));
//     }
//   }

//   /* ===================== RULE 11 ===================== */
//   checkInteractiveInsideInaccessibleParent(comp) {
//     if (!comp.__parent) return;

//     const isInteractive =
//       typeof comp.props.onPress === 'function' ||
//       ['TouchableOpacity', 'TouchableHighlight', 'Pressable', 'Button', 'Text']
//         .includes(comp.type);

//     if (isInteractive && comp.__parent.props?.accessible === false) {
//       this.violations.push(new Violation(
//         'Interactive Element Inside Inaccessible Parent',
//         comp.toString(),
//         'Element unreachable due to inaccessible parent',
//         'Remove accessible={false} from parent',
//         'WCAG 2.1.1 Keyboard Accessible (A)',
//         'CRITICAL'
//       ));
//     }
//   }

//   printReport() {
//     if (this.violations.length === 0) {
//       console.log(chalk.green.bold('🎉 No accessibility violations found!\n'));
//       return;
//     }

//     console.log(chalk.bold(`ACCESSIBILITY VIOLATIONS: ${this.violations.length}\n`));
//     this.violations.forEach((v, i) => {
//       console.log(`--- Violation ${i + 1} ---`);
//       console.log(v.toString());
//     });
//   }
// }

// module.exports = RNAccessibilityChecker;



/**
 * rn_rules.js - React Native accessibility rules (No chalk)
 */

class Violation {
  constructor(ruleName, component, message, fix, wcag, severity) {
    this.ruleName = ruleName;
    this.component = component;
    this.message = message;
    this.fix = fix;
    this.wcag = wcag;
    this.severity = severity;
  }

  toString() {
    const emoji = this.severity === 'CRITICAL' ? '🔴' : this.severity === 'HIGH' ? '🟠' : '🟡';
    return `
${emoji} ${this.severity} - ${this.ruleName}
   Component: ${this.component}
   Problem: ${this.message}
   How to fix: ${this.fix}
   WCAG Rule: ${this.wcag}
`;
  }
}

class RNAccessibilityChecker {
  constructor() {
    this.violations = [];
  }

  check(components) {
    console.log('🔍 Checking React Native accessibility rules...\n');
    components.forEach(component => {
      this.checkComponent(component);
    });
    console.log(`✅ Check complete! Found ${this.violations.length} violations\n`);
    return this.violations;
  }

  checkComponent(comp) {
    this.checkTouchableLabel(comp);
    this.checkImageAccessibility(comp);
    this.checkTouchTargetSize(comp);
    this.checkTextScalability(comp);
    this.checkButtonAccessibility(comp);
    this.checkAccessibleProp(comp);
    comp.children.forEach(child => this.checkComponent(child));
  }

  checkTouchableLabel(comp) {
    const touchableTypes = ['TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback', 'Pressable'];
    if (!touchableTypes.includes(comp.type)) return;
    if (!comp.props.accessibilityLabel) {
      this.violations.push(new Violation(
        'Missing Accessibility Label',
        comp.toString(),
        'Touchable component has no accessibilityLabel',
        `Add accessibilityLabel="Descriptive text" to ${comp.type}`,
        'WCAG 4.1.2 Name, Role, Value (Level A)',
        'CRITICAL'
      ));
    }
  }

  checkImageAccessibility(comp) {
    if (comp.type !== 'Image') return;
    const hasLabel = comp.props.accessibilityLabel;
    const isDecorative = comp.props.accessible === false;
    if (!hasLabel && !isDecorative) {
      this.violations.push(new Violation(
        'Image Missing Description',
        comp.toString(),
        'Image has no accessibilityLabel',
        'Add accessibilityLabel="Description" OR accessible={false} if decorative',
        'WCAG 1.1.1 Non-text Content (Level A)',
        'CRITICAL'
      ));
    }
  }

  checkTouchTargetSize(comp) {
    const interactiveTypes = ['TouchableOpacity', 'TouchableHighlight', 'Pressable', 'Button', 'Switch'];
    if (!interactiveTypes.includes(comp.type)) return;
    const style = comp.props.style;
    if (typeof style === 'string' && 
        (style.includes('width: 30') || style.includes('height: 30') ||
         style.includes('width: 20') || style.includes('height: 20'))) {
      this.violations.push(new Violation(
        'Touch Target Too Small',
        comp.toString(),
        'Interactive element smaller than 44x44 points',
        'Ensure minWidth: 44, minHeight: 44 in style',
        'WCAG 2.5.5 Target Size (AAA) / 2.5.8 (AA)',
        'CRITICAL'
      ));
    }
  }

  checkTextScalability(comp) {
    if (comp.type !== 'Text') return;
    if (comp.props.allowFontScaling === false) {
      this.violations.push(new Violation(
        'Text Scaling Disabled',
        comp.toString(),
        'allowFontScaling={false} prevents text resizing',
        'Remove allowFontScaling={false}',
        'WCAG 1.4.4 Resize Text (Level AA)',
        'HIGH'
      ));
    }
  }

  checkButtonAccessibility(comp) {
    if (comp.type !== 'Button') return;
    const title = comp.props.title;
    if (!title || title.trim() === '') {
      this.violations.push(new Violation(
        'Button Missing Title',
        comp.toString(),
        'Button needs a non-empty title prop',
        'Add title="Descriptive text"',
        'WCAG 4.1.2 Name, Role, Value (Level A)',
        'CRITICAL'
      ));
    }
  }

  checkAccessibleProp(comp) {
    const interactiveTypes = ['TouchableOpacity', 'TouchableHighlight', 'Pressable'];
    if (!interactiveTypes.includes(comp.type)) return;
    if (comp.props.accessible === false && !comp.props.accessibilityLabel) {
      this.violations.push(new Violation(
        'Interactive Element Marked Inaccessible',
        comp.toString(),
        'accessible={false} hides element from screen readers',
        'Remove accessible={false} unless decorative',
        'React Native Best Practice',
        'MEDIUM'
      ));
    }
  }

  printReport() {
    if (this.violations.length === 0) {
      console.log('🎉 PERFECT! No accessibility violations found!\n');
      return;
    }
    console.log('='.repeat(80));
    console.log(`ACCESSIBILITY VIOLATIONS FOUND: ${this.violations.length}`);
    console.log('='.repeat(80) + '\n');
    const critical = this.violations.filter(v => v.severity === 'CRITICAL');
    const high = this.violations.filter(v => v.severity === 'HIGH');
    const medium = this.violations.filter(v => v.severity === 'MEDIUM');
    console.log(`🔴 CRITICAL: ${critical.length} (Must fix before release)`);
    console.log(`🟠 HIGH:     ${high.length} (Should fix soon)`);
    console.log(`🟡 MEDIUM:   ${medium.length} (Nice to fix)\n`);
    this.violations.forEach((v, idx) => {
      console.log(`--- Violation #${idx + 1} ---`);
      console.log(v.toString());
    });
  }
}

module.exports = RNAccessibilityChecker;