"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const withIosAppDelegateImport = (config: any) => {
    // @ts-ignore
    const newConfig = (0, config_plugins_1.withAppDelegate)(config, (config) => {
        const isSwift = config.modResults.contents.includes('import Expo');
        if (isSwift) {
            // Swift AppDelegate (SDK 53+) — no import needed, uses dynamic class loading
            return config;
        }
        // ObjC AppDelegate (SDK 52 and earlier)
        const newSrc = ['#import <RNKeyEvent.h>'];
        const newConfig = (0, generateCode_1.mergeContents)({
            tag: 'react-native-keyevent-import',
            src: config.modResults.contents,
            newSrc: newSrc.join('\n'),
            anchor: `#import "AppDelegate.h"`,
            offset: 1,
            comment: '//',
        });
        return { ...config, modResults: newConfig };
    });
    return newConfig;
};
const withIosAppDelegateBody = (config: any) => {
    // @ts-ignore
    const newConfig = (0, config_plugins_1.withAppDelegate)(config, (config) => {
        const isSwift = config.modResults.contents.includes('import Expo');
        if (isSwift) {
            // Swift AppDelegate (SDK 53+)
            // ExpoAppDelegate inherits from NSObject (not UIResponder), so we cannot
            // override keyCommands on AppDelegate. Instead, we create a UIWindow subclass
            // that handles key commands (UIWindow IS a UIResponder) and replace the
            // window creation in AppDelegate.
            const anchor = config.modResults.contents.includes('@UIApplicationMain')
                ? '@UIApplicationMain'
                : '@main';
            const windowClassSrc = [
                'private var keyEventInstance: NSObject?',
                '',
                'class KeyEventWindow: UIWindow {',
                '  override var keyCommands: [UIKeyCommand]? {',
                '    var keys = [UIKeyCommand]()',
                '    if keyEventInstance == nil {',
                '      if let cls = NSClassFromString("RNKeyEvent") as? NSObject.Type {',
                '        keyEventInstance = cls.init()',
                '      }',
                '    }',
                '    guard let keyEvent = keyEventInstance,',
                '          (keyEvent.value(forKey: "listening") as? Bool) == true else {',
                '      return keys',
                '    }',
                '    let keysString = keyEvent.value(forKey: "keys") as? String ?? ""',
                '    let defaultNames = keysString.components(separatedBy: ",")',
                '    let customNames = [UIKeyCommand.inputUpArrow, UIKeyCommand.inputRightArrow, UIKeyCommand.inputDownArrow, UIKeyCommand.inputLeftArrow, UIKeyCommand.inputPageUp, UIKeyCommand.inputPageDown]',
                '    let allNames = defaultNames + customNames',
                '    for name in allNames {',
                '      let newKey = UIKeyCommand(input: name, modifierFlags: [], action: #selector(keyInput(_:)))',
                '      if #available(iOS 15.0, *) {',
                '        newKey.wantsPriorityOverSystemBehavior = true',
                '      }',
                '      keys.append(newKey)',
                '    }',
                '    return keys',
                '  }',
                '',
                '  @objc func keyInput(_ sender: UIKeyCommand) {',
                '    guard let selected = sender.input else { return }',
                '    keyEventInstance?.perform(NSSelectorFromString("sendKeyEvent:"), with: selected)',
                '  }',
                '}',
            ];
            const result = (0, generateCode_1.mergeContents)({
                tag: 'react-native-keyevent-body',
                src: config.modResults.contents,
                newSrc: windowClassSrc.join('\n'),
                anchor: anchor,
                offset: 0,
                comment: '//',
            });
            // Replace UIWindow with KeyEventWindow for window creation
            result.contents = result.contents.replace(
                'UIWindow(frame: UIScreen.main.bounds)',
                'KeyEventWindow(frame: UIScreen.main.bounds)'
            );
            return {
                ...config,
                modResults: result,
            };
        }
        // ObjC AppDelegate (SDK 52 and earlier)
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
            '    for (NSString* names in namesArray) {',
            '      UIKeyCommand *newKey;',
            '        newKey = [UIKeyCommand keyCommandWithInput:names modifierFlags:0 action:@selector(keyInput:)];',
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
            anchor: `@implementation AppDelegate`,
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
const withAndroidMainActivityImport = (config: any) => {
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
const withAndroidMainActivityBody = (config: any) => {
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
const initPlugin = (config: any) => {
    config = withIosAppDelegateImport(config);
    config = withIosAppDelegateBody(config);
    config = withAndroidMainActivityImport(config);
    config = withAndroidMainActivityBody(config);
    return config;
};
exports.default = initPlugin;
