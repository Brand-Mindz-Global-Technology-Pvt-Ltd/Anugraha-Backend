
import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { resetPasswordSchema } from "../schema/authschema";
import { useAuth } from "../context/Authcontext";
import logo from "../assets/Imgaes/Anugraha logo.png";

const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none " +
    "focus:border-[#d4a13f] focus:ring-2 focus:ring-[#d4a13f]/25";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);

    /* ------------------ Caps Lock handler ------------------ */
    const handleCapsLock = (e) => {
        if (typeof e.getModifierState === "function") {
            setCapsLockOn(e.getModifierState("CapsLock"));
        }
    };

    const handleSubmit = useCallback(
        async (values, { setSubmitting }) => {
            try {
                await resetPassword(token, values.password);
                navigate("/auth/login", { replace: true });
            } finally {
                setSubmitting(false);
            }
        },
        [resetPassword, token, navigate]
    );

    return (
        <div className="min-h-screen bg-slate-100">
            {/* TOP BAR */}
            <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-[#d4a13f]/30 flex items-center px-4 sm:px-6 h-14 sm:h-16 md:h-18">
                <img
                    src={logo}
                    alt="Anugraha Fashions logo"
                    className="h-12 sm:h-14 md:h-16 w-auto object-contain"
                    loading="lazy"
                />
            </header>

            <main className="flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    {/* HEADER */}
                    <div className="text-center mb-6">
                        <img
                            src={logo}
                            alt="Anugraha Fashions logo"
                            className="mx-auto h-20 sm:h-24 w-auto max-w-[200px] object-contain"
                            loading="lazy"
                        />
                        <h1 className="mt-3 font-bold text-xl sm:text-2xl">
                            Reset Password
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Enter your new password
                        </p>
                    </div>

                    {/* FORM */}
                    <Formik
                        initialValues={{ password: "", confirmPassword: "" }}
                        validationSchema={resetPasswordSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-4">
                                {/* NEW PASSWORD */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        New Password <span className="text-red-500">*</span>
                                    </label>

                                    <div className="relative">
                                        <Field
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            className={`${inputClass} pr-10`}
                                            placeholder="Enter your new password"
                                            onKeyUp={handleCapsLock}
                                            onBlur={() => setCapsLockOn(false)}
                                        />

                                        <button
                                            type="button"
                                            aria-label="Toggle password visibility"
                                            onClick={() => setShowPassword((p) => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                        >
                                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>

                                    {/* CAPS LOCK WARNING */}
                                    {capsLockOn && (
                                        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600 font-medium">
                                            <AlertTriangle size={14} />
                                            Caps Lock is ON
                                        </div>
                                    )}

                                    <ErrorMessage
                                        name="password"
                                        component="p"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>

                                {/* CONFIRM PASSWORD */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>

                                    <div className="relative">
                                        <Field
                                            name="confirmPassword"
                                            type={
                                                showConfirmPassword ? "text" : "password"
                                            }
                                            className={`${inputClass} pr-10`}
                                            placeholder="Confirm your password"
                                            onKeyUp={handleCapsLock}
                                            onBlur={() => setCapsLockOn(false)}
                                        />

                                        <button
                                            type="button"
                                            aria-label="Toggle confirm password visibility"
                                            onClick={() =>
                                                setShowConfirmPassword((p) => !p)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                        >
                                            {showConfirmPassword ? (
                                                <Eye size={18} />
                                            ) : (
                                                <EyeOff size={18} />
                                            )}
                                        </button>
                                    </div>
                                    {capsLockOn && (
                                        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600 font-medium">
                                            <AlertTriangle size={14} />
                                            Caps Lock is ON
                                        </div>
                                    )}
                                    <ErrorMessage
                                        name="confirmPassword"
                                        component="p"
                                        className="text-xs text-red-500 mt-1"
                                    />
                                </div>

                                {/* SUBMIT */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full rounded-full bg-gradient-to-r from-[#c89040] via-[#d4a13f] to-[#c89040] hover:from-[#bd8334] hover:via-[#c89040] hover:to-[#bd8334] py-2.5 text-slate-950 text-sm font-semibold tracking-wide shadow-md shadow-[#d4a13f]/25 transition duration-200 disabled:opacity-60"
                                >
                                    {isSubmitting ? "Updating..." : "Reset Password"}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </main>
        </div>
    );
}
