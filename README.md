create virtual env first
building apk: eas build -p android --profile preview

eas build -p android --profile development
npx expo start --tunnel
then scan the QR code from the app
