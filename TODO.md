# TODO: Fix Email Update Error Handling

## Steps to Complete
- [x] Update error handling in `admin/src/utils/controller/auth.controller.js` for the `updateEmail` function to provide clearer messaging for pending email verification errors.
- [x] Add detailed logging in `admin/src/utils/services/firebase/auth.sevices.js` in the `changeEmail` function for better debugging.
- [x] Integrate SweetAlert2 for all alerts in `AccountInformationCard.jsx` and `EmailChangeModal.jsx` to replace browser alerts with better UX.
- [ ] Test the email change flow in the app to confirm the error is handled gracefully with the new message.
- [ ] Verify no regressions in other authentication functions (e.g., signIn, signUp, updatePassword).
- [ ] Run the app locally (`npm run dev`) and check Firebase console for any pending verifications during testing.
