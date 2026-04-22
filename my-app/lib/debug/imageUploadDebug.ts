// DEBUG CHECKLIST FOR SUPABASE IMAGE UPLOAD SYSTEM
// Open browser console (F12) and check each step

export const debugChecklist = {
  step1: {
    name: "File Selection",
    checks: [
      "✓ File exists",
      "✓ File type starts with 'image/'",
      "Log: FILE: {...}"
    ]
  },
  
  step2: {
    name: "Upload to Supabase Storage",
    checks: [
      "✓ Upload response has data",
      "✓ Upload response has no error",
      "✓ Uploaded file path exists",
      "Log: UPLOAD RESULT: { data, error }"
    ]
  },
  
  step3: {
    name: "Get Public URL (CRITICAL)",
    checks: [
      "✓ getPublicUrl() returns data",
      "✓ data.publicUrl is not empty",
      "✓ URL starts with 'http'",
      "✓ URL is valid format",
      "Log: IMAGE URL: {...}"
    ]
  },
  
  step4: {
    name: "Save to Database",
    checks: [
      "✓ INSERT PAYLOAD has title",
      "✓ INSERT PAYLOAD has image (the URL)",
      "✓ Insert response has data",
      "✓ Insert response has no error",
      "✓ data.image or data.thumbnail_url is not empty",
      "Log: INSERT RESULT: { data, error }"
    ]
  },
  
  step5: {
    name: "Display Image in Frontend",
    checks: [
      "✓ Image URL from database is loaded",
      "✓ Image displays without 404 error",
      "✓ Image file is accessible in Supabase Storage",
      "✓ Bucket is public (not RLS protected)",
      "Log: IMAGE LOADED SUCCESSFULLY: {...}"
    ]
  },
  
  commonIssues: {
    "Image not uploading": [
      "Check Supabase bucket name: 'course-images'",
      "Check bucket is public (RLS disabled)",
      "Check file is valid image",
      "Check upload response for error message"
    ],
    
    "URL is undefined": [
      "Check getPublicUrl() is called AFTER upload succeeds",
      "Check data.path exists in upload response",
      "Check bucket is public",
      "Log: PUBLIC URL DATA: {...}"
    ],
    
    "Image not saved in DB": [
      "Check INSERT PAYLOAD has 'image' field",
      "Check image URL is valid (not empty/null)",
      "Check 'courses' table has 'image' or 'thumbnail_url' column",
      "Check database insert response for error"
    ],
    
    "Image not displaying": [
      "Check image URL is not empty in database",
      "Check image URL is accessible (paste in browser)",
      "Check Supabase Storage bucket is public",
      "Check CORS settings if on different domain",
      "Check image onError event in console"
    ]
  },
  
  consoleLogBreakdown: {
    uploadComponent: [
      "FILE: {...} - File object at selection",
      "FILE VALIDATION PASSED: {...} - File type OK",
      "UPLOADING FILE: {...} - About to upload",
      "UPLOAD RESULT: {...} - Upload API response",
      "UPLOAD ERROR: {...} - If upload fails",
      "IMAGE URL: {...} - Public URL generated",
      "CALLBACK EXECUTED WITH URL: {...} - URL sent to parent",
    ],
    
    addCoursePage: [
      "IMAGE URL RECEIVED: {...} - URL received from child",
      "FORM SUBMISSION - Submit button clicked",
      "VALIDATION PASSED - Form data valid",
      "INSERT DATA: {...} - Data being saved to DB",
      "INSERT RESULT: {...} - Database response",
      "COURSE CREATED SUCCESSFULLY: {...} - Success!"
    ]
  }
};

export function logDebugChecklist() {
  console.log("%c=== SUPABASE IMAGE UPLOAD DEBUG CHECKLIST ===", "color: blue; font-size: 16px; font-weight: bold");
  console.log("Follow these 5 steps:");
  console.log("");
  
  Object.entries(debugChecklist.step1).forEach(([key, value]) => {
    if (key === "name") {
      console.log(`%cSTEP 1: ${value}`, "color: green; font-weight: bold");
    }
  });
  debugChecklist.step1.checks.forEach(c => console.log(`  ${c}`));
  console.log("");
  
  Object.entries(debugChecklist.step2).forEach(([key, value]) => {
    if (key === "name") {
      console.log(`%cSTEP 2: ${value}`, "color: green; font-weight: bold");
    }
  });
  debugChecklist.step2.checks.forEach(c => console.log(`  ${c}`));
  console.log("");
  
  Object.entries(debugChecklist.step3).forEach(([key, value]) => {
    if (key === "name") {
      console.log(`%cSTEP 3: ${value}`, "color: green; font-weight: bold");
    }
  });
  debugChecklist.step3.checks.forEach(c => console.log(`  ${c}`));
  console.log("");
  
  Object.entries(debugChecklist.step4).forEach(([key, value]) => {
    if (key === "name") {
      console.log(`%cSTEP 4: ${value}`, "color: green; font-weight: bold");
    }
  });
  debugChecklist.step4.checks.forEach(c => console.log(`  ${c}`));
  console.log("");
  
  Object.entries(debugChecklist.step5).forEach(([key, value]) => {
    if (key === "name") {
      console.log(`%cSTEP 5: ${value}`, "color: green; font-weight: bold");
    }
  });
  debugChecklist.step5.checks.forEach(c => console.log(`  ${c}`));
}
