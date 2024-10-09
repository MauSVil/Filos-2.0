'use client';
interface Props {
  label: string;
  success: boolean;
  successLabel: string;
  error?: string
}

const Step2 = ({ label, success, successLabel, error }: Props) => {
  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold mb-4">{success ? successLabel : label}</h3>
      <p className="text-sm text-red-500">
        {error}
      </p>
    </div>
  )
}

export default Step2;