import Razorpay from "razorpay";

let _razorpay: Razorpay | null = null;
let _lastSecret: string | undefined = undefined;

export const getRazorpay = (): Razorpay => {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

  if (!_razorpay || _lastSecret !== keySecret) {
    _lastSecret = keySecret;
    _razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return _razorpay;
};

export const razorpay: Razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    return Reflect.get(getRazorpay() as unknown as object, prop);
  },
}) as Razorpay;
