import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import { numberToWords } from "@/lib/taxFormStorage";
import "./PrintStyles.css";

interface Form16BProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
}

const monthNames = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
const monthKeys = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'] as const;

const Form16B = ({ client, formData }: Form16BProps) => {
  const taxB = formData.taxCalculationB;
  const form16 = formData.form16Data;

  return (
    <div className="tax-form-container tax-form-print page-break" id="form-16b">
      <div className="form-title">FORM 16 (Part B - Continued)</div>

      {/* Other Sections under Chapter VI-A */}
      <table className="mb-4">
        <thead>
          <tr className="header-row">
            <th colSpan={2}>(B) Other Sections under Chapter VI-A</th>
            <th>GROSS AMOUNT (RS)</th>
            <th>QUALIFYING AMOUNT (RS)</th>
            <th>DEDUCTIBLE AMOUNT (RS)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>(a)</td>
            <td>Section 80TTA</td>
            <td className="amount-cell">{taxB.savingsBankInterest80TTA}</td>
            <td className="amount-cell">{taxB.savingsBankInterest80TTA}</td>
            <td className="amount-cell">{taxB.savingsBankInterest80TTA}</td>
          </tr>
          <tr>
            <td>(b)</td>
            <td>Section 80D</td>
            <td className="amount-cell">{taxB.medicalInsurance80D}</td>
            <td className="amount-cell">{taxB.medicalInsurance80D}</td>
            <td className="amount-cell">{taxB.medicalInsurance80D}</td>
          </tr>
          <tr>
            <td>(c)</td>
            <td>Section 80G</td>
            <td className="amount-cell">{taxB.donation80G * 2}</td>
            <td className="amount-cell">{taxB.donation80G}</td>
            <td className="amount-cell">{taxB.donation80G}</td>
          </tr>
          <tr>
            <td>(d)</td>
            <td>Section 80DD</td>
            <td className="amount-cell">{taxB.disabledDependent80DD}</td>
            <td className="amount-cell">{taxB.disabledDependent80DD}</td>
            <td className="amount-cell">{taxB.disabledDependent80DD}</td>
          </tr>
          <tr>
            <td>(e)</td>
            <td>Section 80U</td>
            <td className="amount-cell">{taxB.disability80U}</td>
            <td className="amount-cell">{taxB.disability80U}</td>
            <td className="amount-cell">{taxB.disability80U}</td>
          </tr>
          <tr className="total-row">
            <td>(f)</td>
            <td>Total: (a) to (e) [Other Sections]</td>
            <td></td>
            <td></td>
            <td className="amount-cell font-bold">
              {taxB.savingsBankInterest80TTA + taxB.medicalInsurance80D + taxB.donation80G + taxB.disabledDependent80DD + taxB.disability80U}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tax Calculation Summary */}
      <table className="mb-4">
        <tbody>
          <tr className="total-row">
            <td>10</td>
            <td>Aggregate of deductible amount under Chapter VI-A [col.9 (A)+(B)]</td>
            <td className="amount-cell font-bold">{taxB.totalDeductions}</td>
          </tr>
          <tr className="total-row">
            <td>11</td>
            <td>TOTAL INCOME (8-10)</td>
            <td className="amount-cell font-bold">{taxB.taxableIncome}</td>
          </tr>
          <tr>
            <td>12</td>
            <td>TAX ON TOTAL INCOME</td>
            <td className="amount-cell">{taxB.totalTax}</td>
          </tr>
          <tr>
            <td>13</td>
            <td>SURCHARGE (on tax computed at SR.NO.12)</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr>
            <td>14</td>
            <td>SECTION 87A TAX REBATE</td>
            <td className="amount-cell">{taxB.taxRebate87A}</td>
          </tr>
          <tr>
            <td></td>
            <td>NET INCOME TAX (12-14)</td>
            <td className="amount-cell">{taxB.taxAfterRebate}</td>
          </tr>
          <tr>
            <td>15</td>
            <td>Education Cess @4% (on tax at S.No.12 plus surcharge at S.No.13)</td>
            <td className="amount-cell">{taxB.educationCess}</td>
          </tr>
          <tr className="total-row">
            <td>16</td>
            <td>TAX PAYABLE (12+13+14+15)</td>
            <td className="amount-cell font-bold">{taxB.totalTaxPayable}</td>
          </tr>
          <tr>
            <td>17</td>
            <td>RELIEF UNDER SECTION 89 (attach details)</td>
            <td className="amount-cell">{taxB.relief89}</td>
          </tr>
          <tr className="total-row">
            <td>18</td>
            <td>TAX PAYABLE (16-17)</td>
            <td className="amount-cell font-bold">{taxB.netTaxPayable}</td>
          </tr>
          <tr>
            <td>19</td>
            <td>(a) Tax deducted at source u/s 192(1)</td>
            <td className="amount-cell">{taxB.totalTaxPaid}</td>
          </tr>
          <tr>
            <td></td>
            <td>(b) Tax paid by employer on behalf of employee u/s 192(1A)</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr className="total-row">
            <td>20</td>
            <td>TAX PAYABLE/REFUNDABLE (18-19)</td>
            <td className="amount-cell font-bold">{taxB.netTaxPayable - taxB.totalTaxPaid}</td>
          </tr>
        </tbody>
      </table>

      {/* TDS Details */}
      <div className="section-title">DETAILS OF TAX DEDUCTED AND DEPOSITED INTO CENTRAL GOVERNMENT ACCOUNT</div>
      <table className="mb-4">
        <thead>
          <tr className="header-row">
            <th>Sr No.</th>
            <th>TDS RS.</th>
            <th>Surcharge RS.</th>
            <th>Education Cess RS.</th>
            <th>Total Tax Deposited Rs</th>
            <th>Month</th>
          </tr>
        </thead>
        <tbody>
          {monthKeys.map((month, index) => (
            <tr key={month}>
              <td className="text-center">{index + 1}</td>
              <td className="amount-cell">{form16.monthlyTds[month].tds}</td>
              <td className="amount-cell">{form16.monthlyTds[month].surcharge}</td>
              <td className="amount-cell">{form16.monthlyTds[month].cess}</td>
              <td className="amount-cell">{form16.monthlyTds[month].total || form16.monthlyTds[month].tds}</td>
              <td>{monthNames[index]}-{index < 9 ? '22' : '23'}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td></td>
            <td className="amount-cell font-bold">
              {monthKeys.reduce((sum, m) => sum + (form16.monthlyTds[m].tds || 0), 0)}
            </td>
            <td className="amount-cell">0</td>
            <td className="amount-cell font-bold">
              {monthKeys.reduce((sum, m) => sum + (form16.monthlyTds[m].cess || 0), 0)}
            </td>
            <td className="amount-cell font-bold">
              {monthKeys.reduce((sum, m) => sum + (form16.monthlyTds[m].total || form16.monthlyTds[m].tds || 0), 0)}
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Certification */}
      <div className="border border-gray-400 p-4 mt-4">
        <p className="mb-2">
          I <strong>{form16.headMasterName || client.tdo}</strong> SON OF:- <strong>{form16.headMasterFatherName}</strong>
        </p>
        <p className="mb-2">
          Working in the capacity of:- <strong>{form16.headMasterDesignation}</strong> (designation) do hereby certify that a sum of
        </p>
        <p className="mb-2">
          Rs:- <strong>{taxB.totalTaxPaid}</strong> (in words) <strong>{numberToWords(taxB.totalTaxPaid)}</strong>
        </p>
        <p className="mb-2">
          has been deducted at source and paid to the credit of the Central Government.
        </p>
        <p className="mb-4 text-sm">
          I further certify that the information given above is true and correct based on the books of account, documents and other available records.
        </p>

        <div className="flex justify-between mt-8">
          <div>
            <p>DATE:- {form16.certificationDate || "31-03-2023"}</p>
            <p>PLACE: {form16.certificationPlace || client.payCenterName}</p>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2 min-w-[200px]">
              Signature
            </div>
            <p className="mt-2">Full Name: {form16.headMasterName || client.tdo}</p>
            <p>Designation: {form16.headMasterDesignation}</p>
          </div>
        </div>
      </div>

      <div className="footer-note">
        Created By: Smart Computer Vinchhiya - Rupsangbhai Jamod-9924640689
      </div>
    </div>
  );
};

export default Form16B;
