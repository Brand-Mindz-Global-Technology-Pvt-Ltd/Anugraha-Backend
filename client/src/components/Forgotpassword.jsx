import { useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordSchema } from "../schema/authschema";
import { useAuth } from "../context/Authcontext";
import logo from "../assets/Imgaes/Anugraha logo.png";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none " +
  "focus:border-[#d4a13f] focus:ring-2 focus:ring-[#d4a13f]/25";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate("")
  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      try {
        await forgotPassword(values.email);
        resetForm();
        navigate("/auth/login")
      } finally {
        setSubmitting(false);
      }
    },
    [forgotPassword]
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="h-14 sm:h-16 md:h-18 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-[#d4a13f]/30 flex items-center px-4 sm:px-6">
        <img
          src={logo}
          alt="Anugraha Fashions logo"
          className="h-12 sm:h-14 md:h-16 w-auto object-contain"
          loading="lazy"
        />      </header>

      <main className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <img
              src={logo}
              alt="Anugraha Fashions logo"
              className="mx-auto h-20 sm:h-24 w-auto max-w-[200px] object-contain"
              loading="lazy"
            />            <h1 className="mt-3 font-bold text-xl sm:text-2xl">
              Forgot Password?
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Enter your email to receive a reset link
            </p>
          </div>

          <Formik
            initialValues={{ email: "" }}
            validationSchema={forgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-xs text-red-500 mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-gradient-to-r from-[#c89040] via-[#d4a13f] to-[#c89040] hover:from-[#bd8334] hover:via-[#c89040] hover:to-[#bd8334] py-2.5 text-slate-950 text-sm font-semibold tracking-wide shadow-md shadow-[#d4a13f]/25 transition duration-200 disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-5 text-center text-sm text-slate-500">
            Remembered?{" "}
            <Link to="/auth/login" className="text-[#b8860b] hover:text-[#996515] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
