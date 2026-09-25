# Firebase setup

The site uses Firebase Authentication for passwords and Cloud Firestore for the admin allow-list.

## 1. Enable email/password login

1. Open the Firebase console for project `kkopiconnect-2f015`.
2. Open **Authentication** > **Sign-in method**.
3. Enable **Email/Password** and save.
4. In **Authentication** > **Users**, add the admin email and a strong password.
5. Copy the new user's **UID**.

## 2. Create the admin record

Open **Firestore Database**, create a document in the `admins` collection, and use the Authentication UID as the document ID.

Required fields:

```text
name: "Store Administrator"
role: "admin"
active: true
```

The document must be `admins/{firebase-auth-user-uid}`. The login will reject accounts when the document is missing, the role is not `admin`, or `active` is not exactly `true`.

## 3. Apply Firestore rules

Deploy the rules in `firestore.rules`, or copy them into **Firestore Database** > **Rules**. These rules allow an authenticated user to read only their own admin record and prevent browser clients from changing admin status.

Do not add a public admin-registration form. Admin users and their records should be created from the Firebase console or a trusted server process.

## 4. Run the PHP site

Open the project through a PHP-capable local server such as XAMPP or Laragon. Do not open `admin-login.php` directly with a `file://` URL because browser module imports and Firebase requests require an HTTP origin.

After signing in, the page verifies the same admin record again before displaying the dashboard. Use **Forgot password?** on the login page to send a Firebase password reset email.

## Code responsibilities

- PHP: page delivery and HTML structure.
- HTML/CSS: page structure and presentation.
- JavaScript: Firebase authentication, Firestore admin checks, persistence, password reset, dashboard protection, and logout.
- Firebase: passwords, sessions, and the admin allow-list database.
