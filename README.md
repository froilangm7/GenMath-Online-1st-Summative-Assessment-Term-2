# EMNHS Secure Examination Portal — GitHub Pages

This project is a **front-end examination launcher** for a Microsoft Forms quiz.

## What it does

- Requests browser fullscreen when the student starts.
- Embeds the Microsoft Forms quiz.
- Runs a visible 40-minute portal timer.
- Detects common browser/page focus events:
  - tab/app visibility loss
  - window focus loss
  - page navigation/hide
  - fullscreen exit
  - selected restricted keyboard commands
- Freezes the portal when a security event is detected.
- Shows a teacher-facing "paper version" instruction.
- Stores the last incident locally.
- Optionally sends incident data to a teacher-controlled endpoint.

## IMPORTANT LIMITATION

This is **not a true Android kiosk/lockdown system**.

A normal GitHub Pages website cannot reliably prevent a student from:
- using another physical device,
- bypassing browser restrictions,
- using certain Android system features,
- exploiting browser/device-specific behavior,
- taking screenshots in every possible environment.

For genuine Android lockdown, the device must be managed in an Android Enterprise/dedicated-device configuration, or students must use a purpose-built secure assessment application. Android's official Lock Task Mode is an OS/device-management feature, not a JavaScript feature.

## Setup

1. Create a Microsoft Forms quiz.
2. Configure Forms:
   - People in your organization can respond (if available in your DepEd tenant)
   - One response per person
   - Set start/end date
   - Set time duration
   - Shuffle questions
   - Shuffle options for choice questions
   - Turn OFF "Show results automatically"
3. Copy the Microsoft Forms quiz URL.
4. Open `config.js`.
5. Replace:
   `PASTE_YOUR_MICROSOFT_FORMS_QUIZ_URL_HERE`
   with your actual Forms URL.
6. Commit the files to a GitHub repository.
7. Enable GitHub Pages from the repository's Settings → Pages.
8. Open the published HTTPS GitHub Pages URL.
9. Test it on the exact Android models/browsers your students will use.

## Stronger deployment model

For a genuinely controlled exam, use:
- school-managed Android devices in kiosk/lock-task mode, OR
- a dedicated secure assessment/lockdown application.

Do not rely on this website alone for disciplinary decisions. Browser focus events can produce false positives from calls, notifications, OS behavior, crashes, and connectivity problems.

## Recommended teacher procedure

If a freeze occurs:
1. Student remains seated.
2. Teacher records the event.
3. Teacher checks whether it was a technical interruption or an apparent intentional violation.
4. If unresolved, move the student to the supervised paper version.
5. Do not automatically assign a zero solely from a browser event.

## Privacy

If you enable `INCIDENT_ENDPOINT`, collect only the minimum information necessary and make sure the endpoint and retention process comply with your school's privacy rules.
