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
  const fy = formData.salaryData.financialYear.split('-');
  const yearSuffix1 = fy[0]?.slice(-2) || '25';
  const yearSuffix2 = fy[1]?.slice(-2) || '26';

  return (
    <div className="tax-form-container tax-form-print" id="form-16b">
      <div className="text-center font-bold text-lg mb-3">FORM 16 (Part B - Continued)</div>

      {/* Other Sections under Chapter VI-A */}
      <div className="font-bold text-[11px] mb-1 bg-gray-200 p-1">
        Other sections (e.g. 80E, 80U, 80D, 80G)
      </div>
      <table className="mb-3" style={{ fontSize: '10px' }}>
        <thead>
          <tr className="header-row">
            <th className="w-8"></th>
            <th>Section</th>
            <th className="w-24">GROSS AMOUNT (RS)</th>
            <th className="w-28">QUALIFYING AMOUNT (RS)</th>
            <th className="w-28">DEDUCTIBLE AMOUNT (RS)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>(a)</td>
            <td>Section: 80TTA</td>
            <td className="amount-cell">{taxB.savingsBankInterest80TTA || 0}</td>
            <td className="amount-cell">{taxB.savingsBankInterest80TTA || 0}</td>
            <td className="amount-cell">{taxB.savingsBankInterest80TTA || 0}</td>
          </tr>
          <tr>
            <td>(b)</td>
            <td>Section: 80D</td>
            <td className="amount-cell">{taxB.medicalInsurance80D || 0}</td>
            <td className="amount-cell">{taxB.medicalInsurance80D || 0}</td>
            <td className="amount-cell">{taxB.medicalInsurance80D || 0}</td>
          </tr>
          <tr>
            <td>(c)</td>
            <td>Section: 80G</td>
            <td className="amount-cell">{(taxB.donation80G || 0) * 2}</td>
            <td className="amount-cell">{taxB.donation80G || 0}</td>
            <td className="amount-cell">{taxB.donation80G || 0}</td>
          </tr>
          <tr>
            <td>(d)</td>
            <td>Section: 80DD</td>
            <td className="amount-cell">{taxB.disabledDependent80DD || 0}</td>
            <td className="amount-cell">{taxB.disabledDependent80DD || 0}</td>
            <td className="amount-cell">{taxB.disabledDependent80DD || 0}</td>
          </tr>
          <tr>
            <td>(e)</td>
            <td>Section: 80U</td>
            <td className="amount-cell">{taxB.disability80U || 0}</td>
            <td className="amount-cell">{taxB.disability80U || 0}</td>
            <td className="amount-cell">{taxB.disability80U || 0}</td>
          </tr>
          <tr className="total-row">
            <td>(f)</td>
            <td>Total: (a) to (e) [Other Sections]</td>
            <td></td>
            <td></td>
            <td className="amount-cell font-bold">
              {(taxB.savingsBankInterest80TTA || 0) + (taxB.medicalInsurance80D || 0) + 
               (taxB.donation80G || 0) + (taxB.disabledDependent80DD || 0) + (taxB.disability80U || 0)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tax Calculation Summary */}
      <table className="mb-3" style={{ fontSize: '10px' }}>
        <tbody>
          <tr className="total-row">
            <td className="w-6">10</td>
            <td>Aggregate of deductible amount under Chapter VI-A [col.9 (A)+(B)]</td>
            <td className="amount-cell w-24 font-bold">{taxB.totalDeductions || 0}</td>
          </tr>
          <tr className="total-row">
            <td>11</td>
            <td>TOTAL INCOME (8-10)</td>
            <td className="amount-cell font-bold">{taxB.taxableIncome || 0}</td>
          </tr>
          <tr>
            <td>12</td>
            <td>TAX ON TOTAL INCOME</td>
            <td className="amount-cell">{taxB.totalTax || 0}</td>
          </tr>
          <tr>
            <td>13</td>
            <td>SURCHARGE (on tax computed at SR.NO.12)</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr>
            <td>14</td>
            <td>SECTION 87A TAX REBATE</td>
            <td className="amount-cell">{taxB.taxRebate87A || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>NET INCOME TAX (12-14)</td>
            <td className="amount-cell">{taxB.taxAfterRebate || 0}</td>
          </tr>
          <tr>
            <td>15</td>
            <td>Education Cess @4% (on tax at S.No.12 plus surcharge at S.No.13)</td>
            <td className="amount-cell">{taxB.educationCess || 0}</td>
          </tr>
          <tr className="total-row">
            <td>16</td>
            <td>TAX PAYABLE (12+13+14+15)</td>
            <td className="amount-cell font-bold">{taxB.totalTaxPayable || 0}</td>
          </tr>
          <tr>
            <td>17</td>
            <td>RELIEF UNDER SECTION 89 (attach details)</td>
            <td className="amount-cell">{taxB.relief89 || 0}</td>
          </tr>
          <tr className="total-row">
            <td>18</td>
            <td>TAX PAYABLE (16-17)</td>
            <td className="amount-cell font-bold">{taxB.netTaxPayable || 0}</td>
          </tr>
          <tr>
            <td>19</td>
            <td>(a) Tax deducted at source u/s 192(1)</td>
            <td className="amount-cell">{taxB.totalTaxPaid || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(b) Tax paid by employer on behalf of employee u/s 192(1A)</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr className="total-row">
            <td>20</td>
            <td>TAX PAYABLE/REFUNDABLE (18-19)</td>
            <td className="amount-cell font-bold">{(taxB.netTaxPayable || 0) - (taxB.totalTaxPaid || 0)}</td>
          </tr>
        </tbody>
      </table>

      {/* TDS Details */}
      <div className="font-bold text-[11px] mb-1 bg-gray-200 p-1">
        DETAILS OF TAX DEDUCTED AND DEPOSITED INTO CENTRAL GOVERNMENT ACCOUNT
      </div>
      <table className="mb-3" style={{ fontSize: '9px' }}>
        <thead>
          <tr className="header-row">
            <th className="w-8">Sr No.</th>
            <th className="w-16">TDS RS.</th>
            <th className="w-16">Surcharge RS.</th>
            <th className="w-20">Education Cess RS.</th>
            <th className="w-20">Total Tax Deposit Rs</th>
            <th>Month</th>
          </tr>
        </thead>
        <tbody>
          {monthKeys.map((month, index) => (
            <tr key={month}>
              <td className="text-center">{index + 1}</td>
              <td className="amount-cell">{form16.monthlyTds[month].tds || 0}</td>
              <td className="amount-cell">{form16.monthlyTds[month].surcharge || 0}</td>
              <td className="amount-cell">{form16.monthlyTds[month].cess || 0}</td>
              <td className="amount-cell">{form16.monthlyTds[month].total || form16.monthlyTds[month].tds || 0}</td>
              <td>{monthNames[index]}-{index < 9 ? yearSuffix1 : yearSuffix2}</td>
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
      <div className="border border-black p-2 mt-2 text-[9px]">
        <p className="mb-1">
          I <strong>{form16.headMasterName || client.headMaster || client.tdo || '_______________'}</strong> SON OF:- <strong>{form16.headMasterFatherName || client.headMasterFather || '_______________'}</strong>
        </p>
        <p className="mb-1">
          Working in the capacity of:- <strong>{form16.headMasterDesignation || 'HEAD MASTER'}</strong> (designation) do hereby certify that a sum of
        </p>
        <p className="mb-1">
          Rs:- <strong>{taxB.totalTaxPaid || 0}</strong> (in words) <strong>{numberToWords(taxB.totalTaxPaid || 0)}</strong>
        </p>
        <p className="mb-1">
          has been deducted at source and paid to the credit of the Central Government.
        </p>
        <p className="text-[8px]">
          I further certify that the information given above is true and correct based on the books of account, documents and other available records.
        </p>

        <div className="flex justify-between mt-8 text-[9px]">
          <div>
            <p className="text-[9px]">DATE:- {form16.certificationDate || '_______________'}</p>
            <p className="text-[9px]">PLACE: {form16.certificationPlace || client.headMasterPlace || client.payCenterName || '_______________'}</p>
          </div>
          <div className="text-center text-[9px]">
            <div className="border-t border-black pt-1 min-w-[120px]">
              Signature
            </div>
            <p className="mt-1 text-[9px]">Full Name: {form16.headMasterName || client.headMaster || client.tdo || '_______________'}</p>
            <p className="text-[9px]">Designation: {form16.headMasterDesignation || 'HEAD MASTER'}</p>
          </div>
        </div>
      </div>

      <div className="form-footer text-center text-[7px] mt-2 pt-1 border-t border-dashed border-gray-400">
        Created By: Smart Computer Vinchhiya 9924640689, 9574031243
      </div>
    </div>
  );
};

export default Form16B;
