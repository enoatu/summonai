import Cocoa

// logを出す
print("Hello, world!")


let options = [kAXTrustedCheckOptionPrompt.takeRetainedValue() as String: true]
let accessibilityEnabled = AXIsProcessTrustedWithOptions(options as CFDictionary)

            showAlert()

    print("アクセシビリティの許可が必要です。1")

if !accessibilityEnabled {
    print("アクセシビリティの許可が必要です。")
    exit(1)
}


let systemWideElement = AXUIElementCreateSystemWide()

while true {
    var pointer: AnyObject?
    let error = AXUIElementCopyAttributeValue(systemWideElement, kAXFocusedUIElementAttribute as CFString, &pointer)
    if error == .success, let focusedUiElement = pointer {
        var selectedTextPointer: AnyObject?
        let textError = AXUIElementCopyAttributeValue(focusedUiElement as! AXUIElement, kAXSelectedTextAttribute as CFString, &selectedTextPointer)
        if textError == .success, let selectedText = selectedTextPointer as? String {
            print("選択されたテキスト: \(selectedText)")
            showAlert()
        }
    }

    // 高頻度でループするとCPU使用率が高くなるため、少し待つ
    Thread.sleep(forTimeInterval: 1.0)
}
func showAlert() {
    let alert = NSAlert()
    alert.messageText = "This is the dialog title"
    alert.informativeText = "This is the dialog message."
    alert.addButton(withTitle: "OK")
    alert.runModal()
}
