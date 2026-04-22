// Example usage of debug utilities
// Add this to any page or component to enable debugging

import { logDebugChecklist } from "@/lib/debug/imageUploadDebug";

export function ImageUploadDebugger() {
  return (
    <button
      onClick={() => {
        logDebugChecklist();
      }}
      className="mt-4 p-2 text-xs bg-blue-600 text-white rounded"
    >
      📋 Log Debug Checklist
    </button>
  );
}

// USAGE IN COMPONENT:
// 
// import { ImageUploadDebugger } from "@/lib/debug/imageUploadExample";
//
// export default function MyComponent() {
//   return (
//     <div>
//       <h1>My Component</h1>
//       <ImageUploadDebugger />
//     </div>
//   );
// }
//
// Or call directly in browser console:
// import { logDebugChecklist } from '/lib/debug/imageUploadDebug.ts'
// logDebugChecklist()
