import { SITE } from "@/lib/site";

interface TrackingFormProps {
  defaultCode?: string;
  error?: string;
}

/** Plain GET form: it works without JavaScript and the code stays in the address bar. */
export function TrackingForm({ defaultCode = "", error }: TrackingFormProps) {
  const errorId = "tr-code-error";

  return (
    <form action="/seguimiento" method="get" className="mt-6">
      <label htmlFor="tr-code" className="mb-2 block text-[15px] font-semibold">
        Código de seguimiento
      </label>
      <div className="flex flex-wrap gap-2.5">
        <input
          id="tr-code"
          name="codigo"
          defaultValue={defaultCode}
          maxLength={32}
          autoComplete="off"
          placeholder={SITE.trackingExample}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-[54px] min-w-0 flex-[1_1_200px] rounded-md border-2 bg-white px-4 font-mono text-lg font-semibold tracking-[0.06em] uppercase outline-none focus:border-navy ${error ? "border-[#D02A31]" : "border-field"}`}
        />
        <button
          type="submit"
          className="h-[54px] cursor-pointer rounded-md border-0 bg-navy px-7 text-base font-bold text-white hover:bg-navy-dark"
        >
          Consultar
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
