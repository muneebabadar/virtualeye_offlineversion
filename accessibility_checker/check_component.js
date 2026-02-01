#!/usr/bin/env node
/**
 * check_component.js - MAIN SCRIPT (No chalk dependency)
 */

const TSXParser = require('./tsx_parser');
const RNAccessibilityChecker = require('./rn_rules');

function main() {
  console.log('\n' + '='.repeat(80));
  console.log('V-EYE REACT NATIVE ACCESSIBILITY CHECKER');
  console.log('='.repeat(80) + '\n');

  const filePath = process.argv[2];
  
  if (!filePath) {
    console.log('❌ ERROR: No .tsx file specified!\n');
    console.log('How to use:');
    console.log('  node check_component.js welcome.tsx\n');
    process.exit(1);
  }

  try {
    const parser = new TSXParser(filePath);
    const components = parser.parse();
    
    parser.printComponents();
    console.log();

    const checker = new RNAccessibilityChecker();
    const violations = checker.check(components);

    checker.printReport();

    const criticalCount = violations.filter(v => v.severity === 'CRITICAL').length;
    
    if (criticalCount > 0) {
      console.log(`\n❌ BUILD WOULD FAIL: ${criticalCount} critical violations\n`);
      process.exit(criticalCount);
    } else if (violations.length > 0) {
      console.log(`\n⚠️  WARNINGS: ${violations.length} non-critical issues\n`);
      process.exit(0);
    } else {
      console.log('\n✅ PASS: Component is fully accessible!\n');
      process.exit(0);
    }

  } catch (error) {
    console.log('\n❌ ERROR:\n');
    console.log(error.message);
    console.log('\nStack trace:');
    console.log(error.stack);
    process.exit(1);
  }
}

main();