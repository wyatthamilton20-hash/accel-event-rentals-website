export function EmailSignupSection() {
  return (
    <section
      className="w-full px-4 sm:px-6 py-10 sm:py-14 text-center"
      style={{ background: "#e8e5e0", borderRadius: "20px 20px 0 0" }}
    >
      <h2 style={{ fontWeight: 700, color: "#111111", margin: 0, lineHeight: 1.1, fontSize: "clamp(28px, 7vw, 64px)" }}>
        Get on the list.
      </h2>
      <p className="mt-2 text-[15px] text-[#111] max-sm:text-sm">
        Score VIP access to special offers, event photos, new products, and more.
      </p>
      <div className="mx-auto mt-6 flex max-w-[500px] flex-col gap-3 sm:relative sm:flex-row sm:gap-0">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full rounded-full border-2 border-[#111] bg-transparent px-6 py-3 text-[16px] text-[#111] outline-none sm:pr-[150px]"
        />
        <button
          type="button"
          className="w-full rounded-full bg-[#111] px-6 py-3 text-[14px] font-bold tracking-wider text-white cursor-pointer sm:absolute sm:right-1 sm:top-1/2 sm:w-auto sm:-translate-y-1/2 sm:px-6 sm:py-2.5"
          style={{ border: "none", letterSpacing: "1px" }}
        >
          SIGN ME UP
        </button>
      </div>
    </section>
  );
}
