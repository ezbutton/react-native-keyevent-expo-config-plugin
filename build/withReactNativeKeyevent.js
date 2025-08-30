"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const withIosAppDelegateImport = (config) => {
    // @ts-ignore
    const newConfig = (0, config_plugins_1.withAppDelegate)(config, (config) => {
        const newSrc = ['#import <RNKeyEvent.h>'];
        const newConfig = (0, generateCode_1.mergeContents)({
            tag: 'react-native-keyevent-import',
            src: config.modResults.contents,
            newSrc: newSrc.join('\n'),
            anchor: `#import "AppDelegate.h"`,
            offset: 1,
            comment: '//',
        });
        return {
            ...config,
            modResults: newConfig,
        };
    });
    return newConfig;
};
const withIosAppDelegateBody = (config) => {
    // @ts-ignore
    const newConfig = (0, config_plugins_1.withAppDelegate)(config, (config) => {
        const newSrc = [
            'RNKeyEvent *keyEvent = nil;',
            ' ',
            '- (NSMutableArray<UIKeyCommand *> *)keyCommands {',
            '  NSMutableArray *keys = [NSMutableArray new];',
            '   ',
            '  if (keyEvent == nil) {',
            '    keyEvent = [[RNKeyEvent alloc] init];',
            '  }',
            '   ',
            '  if ([keyEvent isListening]) {',
            '    NSArray *defaultNamesArray = [[keyEvent getKeys] componentsSeparatedByString:@","];',
            '    NSArray *customNamesArray = [NSArray arrayWithObjects:UIKeyInputUpArrow, UIKeyInputRightArrow, UIKeyInputDownArrow, UIKeyInputLeftArrow, UIKeyInputPageUp, UIKeyInputPageDown, nil];',
            '    NSMutableArray *namesArray = [NSMutableArray arrayWithArray:defaultNamesArray];',
            '    [namesArray addObjectsFromArray:customNamesArray];',
            '     ',
            '    //NSCharacterSet *validChars = [NSCharacterSet characterSetWithCharactersInString:@"ABCDEFGHIJKLMNOPQRSTUVWXYZ"];',
            '     ',
            '    for (NSString* names in namesArray) {',
            '      //NSRange  range = [names rangeOfCharacterFromSet:validChars];',
            '       ',
            '      UIKeyCommand *newKey;',
            '      //if (NSNotFound != range.location) {',
            '      //  [keys addObject: [UIKeyCommand keyCommandWithInput:names modifierFlags:UIKeyModifierShift action:@selector(keyInput:)]];',
            '      //} else {',
            '        newKey = [UIKeyCommand keyCommandWithInput:names modifierFlags:0 action:@selector(keyInput:)];',
            '      //}',
            '      if (@available(iOS 15.0, *)) {',
            '          newKey.wantsPriorityOverSystemBehavior = true;',
            '      }',
            '      [keys addObject:newKey];',
            '    }',
            '  }',
            '   ',
            '  return keys;',
            '}',
            '',
            '- (void)keyInput:(UIKeyCommand *)sender {',
            '  NSString *selected = sender.input;',
            '  [keyEvent sendKeyEvent:selected];',
            '}',
        ];
        const newConfig = (0, generateCode_1.mergeContents)({
            tag: 'react-native-keyevent-body',
            src: config.modResults.contents,
            newSrc: newSrc.join('\n'),
            anchor: `@implementation AppDelegate`, // /#import "AppDelegate\.h"/g,
            offset: 1,
            comment: '//',
        });
        return {
            ...config,
            modResults: newConfig,
        };
    });
    return newConfig;
};
const withAndroidMainActivityImport = (config) => {
    // @ts-ignore
    const newConfig = (0, config_plugins_1.withMainActivity)(config, (config) => {
        const newSrc = [
            'import android.view.KeyEvent',
            'import com.github.kevinejohn.keyevent.KeyEventModule',
        ];
        const newConfig = (0, generateCode_1.mergeContents)({
            tag: 'react-native-keyevent-import',
            src: config.modResults.contents,
            newSrc: newSrc.join('\n'),
            anchor: `import`,
            offset: 1,
            comment: '//',
        });
        return {
            ...config,
            modResults: newConfig,
        };
    });
    return newConfig;
};
const withAndroidMainActivityBody = (config) => {
    // @ts-ignore
    const newConfig = (0, config_plugins_1.withMainActivity)(config, (config) => {
        const newSrc = [
            'override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {',
            '   // // Uncomment this if key events should only trigger once when key is held down',
            '  // if (event.getRepeatCount() == 0) {',
            '  //   KeyEventModule.getInstance().onKeyDownEvent(keyCode, event)',
            '  // }',
            '',
            '  // // This will trigger the key repeat if the key is held down',
            '  // // Comment this out if uncommenting the above',
            '  KeyEventModule.getInstance().onKeyDownEvent(keyCode, event)',
            '',
            '  // // Uncomment this if you want the default keyboard behavior',
            '  val keyCodesToPassthrough = intArrayOf(24, 25)',
            '  if (keyCodesToPassthrough.contains(keyCode)) {',
            '    return super.onKeyDown(keyCode, event)',
            '  } else {',
            '  // // The default keyboard behaviour wll be overridden',
            '  // // This is similar to what e.preventDefault() does in a browser',
            '  // // comment this if uncommenting the above',
            '  super.onKeyDown(keyCode, event)',
            '  return true',
            '  }',
            '}',
            '',
            'override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {',
            '  KeyEventModule.getInstance().onKeyUpEvent(keyCode, event)',
            '',
            '  // // Uncomment this if you want the default keyboard behavior',
            '  val keyCodesToPassthrough = intArrayOf(24, 25)',
            '  if (keyCodesToPassthrough.contains(keyCode)) {',
            '     return super.onKeyUp(keyCode, event)',
            '  } else {',
            '  // // The default keyboard behaviour wll be overridden',
            '  // // This is similar to what e.preventDefault() does in a browser',
            '  // // comment this if uncommenting the above',
            '  super.onKeyUp(keyCode, event)',
            '  return true',
            '  }',
            '}',
            '',
            'override fun onKeyMultiple(keyCode: Int, repeatCount: Int, event: KeyEvent): Boolean {',
            '    KeyEventModule.getInstance().onKeyMultipleEvent(keyCode, repeatCount, event)',
            '    return super.onKeyMultiple(keyCode, repeatCount, event)',
            '}',
        ];
        const newConfig = (0, generateCode_1.mergeContents)({
            tag: 'react-native-keyevent-body',
            src: config.modResults.contents,
            newSrc: newSrc.join('\n'),
            anchor: `class MainActivity`,
            offset: 1,
            comment: '//',
        });
        return {
            ...config,
            modResults: newConfig,
        };
    });
    return newConfig;
};
const initPlugin = (config) => {
    config = withIosAppDelegateImport(config);
    config = withIosAppDelegateBody(config);
    config = withAndroidMainActivityImport(config);
    config = withAndroidMainActivityBody(config);
    return config;
};
exports.default = initPlugin;
