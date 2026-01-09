export const resetPasswordTemplate = ({ username, resetUrl }) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
    <div style="max-width:520px;margin:40px auto;background:#ffffff;
      border-radius:14px;padding:30px">

      <h2 style="color:#0f172a">Hello ${username},</h2>

      <p style="color:#334155">
        You requested to reset your password. Click the button below.
      </p>

      <a href="${resetUrl}"
         style="display:inline-block;margin-top:20px;
         padding:12px 28px;background:#4338ca;color:#fff;
         text-decoration:none;border-radius:999px;font-weight:600;">
        Reset Password
      </a>

      <p style="margin-top:20px;font-size:14px;color:#64748b">
        This link expires in 15 minutes.
      </p>

    </div>
  </body>
</html>
`;
