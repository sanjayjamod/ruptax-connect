import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import "./PrintStyles.css";

interface Form16AProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
}

const Form16A = ({ client, formData }: Form16AProps) => {
  const taxA = formData.taxCalculationA;
  const taxB = formData.taxCalculationB;
  const form16 = formData.form16Data;

  return (
    <div className="tax-form-container tax-form-print page-break" id="form-16a">
      <div className="text-center font-bold text-lg mb-1">FORM 16</div>
      <div className="text-center text-xs mb-2">SEE RULES 31 (1) (A)</div>
      <div className="text-center text-[10px] mb-3 border-b border-black pb-2">
        Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source from income chargeable under the head "Salaries"
      </div>

      {/* Header Info - Two Column Layout */}
      <table className="mb-3" style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td className="w-1/2 align-top border border-black p-2">
              <p className="font-bold mb-1">Name And Address of the employer</p>
              <p>{form16.employerName || 'EDUCATION DEPARTMENT'}</p>
              <p>{client.payCenterName || '-'}</p>
              <p>{client.payCenterAddress || '-'}</p>
              <p>PIN :- {client.place ? '360055' : ''}</p>
              <p className="mt-2">PAN/GLR No: {form16.employerPan || '-'}</p>
              <p>TAN: {form16.employerTan || 'RKTT01474E'}</p>
            </td>
            <td className="w-1/2 align-top border border-black p-2">
              <p className="font-bold mb-1">Name And Designation of the employee</p>
              <p className="font-bold">{client.name}</p>
              <p>{client.designation || '-'}</p>
              <p>{client.schoolName || '-'}</p>
              <p>{client.place || '-'}</p>
              <p className="mt-2">PAN/NO.: {client.panNo || '-'}</p>
              <p>ASSESSMENT YEAR: {client.assessmentYear || '2026-2027'}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <p className="text-[10px] mb-1">TDS Circle where Annual Return/Statement under section 206 is to be filed</p>
      <p className="text-[10px] mb-3">PERIOD: FROM {formData.salaryData.accountingYear}</p>

      {/* Quarterly Acknowledgement */}
      <p className="text-[10px] mb-1 font-bold">Acknowledgement Nos. of all Quarterly statements of TDS</p>
      <table className="mb-3" style={{ fontSize: '10px' }}>
        <thead>
          <tr className="header-row">
            <th>Quarter</th>
            <th>Acknowledgement No</th>
            <th>From</th>
            <th>To</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Quarter-1</td>
            <td>{form16.quarters.q1.acknowledgementNo}</td>
            <td>{form16.quarters.q1.from}</td>
            <td>{form16.quarters.q1.to}</td>
          </tr>
          <tr>
            <td>Quarter-2</td>
            <td>{form16.quarters.q2.acknowledgementNo}</td>
            <td>{form16.quarters.q2.from}</td>
            <td>{form16.quarters.q2.to}</td>
          </tr>
          <tr>
            <td>Quarter-3</td>
            <td>{form16.quarters.q3.acknowledgementNo}</td>
            <td>{form16.quarters.q3.from}</td>
            <td>{form16.quarters.q3.to}</td>
          </tr>
          <tr>
            <td>Quarter-4</td>
            <td>{form16.quarters.q4.acknowledgementNo}</td>
            <td>{form16.quarters.q4.from}</td>
            <td>{form16.quarters.q4.to}</td>
          </tr>
        </tbody>
      </table>

      {/* Salary Details */}
      <div className="font-bold text-[11px] mb-1 bg-gray-200 p-1">
        DETAILS OF SALARY PAID AND ANY OTHER INCOME AND TAX DEDUCTED
      </div>
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr>
            <td colSpan={2}>1. Gross Salary</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td className="w-8"></td>
            <td>(a) Salary as per provisions Contained in section 17(1)</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell w-20">{taxA.grossSalary || 0}</td>
          </tr>
          <tr>
            <td></td>
            <td>(b) Value of perquisites u/s 17(2)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr>
            <td></td>
            <td>(c) Profits in lieu of salary under section 17(3)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td>(d) TOTAL</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxA.grossSalary || 0}</td>
          </tr>
          <tr>
            <td colSpan={2}>2. Less: Allowance to the extent exempt under section 10</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxA.totalExempt || 0}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={2}>3. BALANCE (1-2)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxA.balanceSalary || taxA.grossSalary || 0}</td>
          </tr>
          <tr>
            <td colSpan={4}>4. DEDUCTIONS:</td>
          </tr>
          <tr>
            <td></td>
            <td>(a) Standard Deduction (New Regime)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxA.standardDeduction || 75000}</td>
          </tr>
          <tr>
            <td></td>
            <td>(b) Tax on Employment</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxA.professionTax || 0}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={2}>5. Aggregate of 4(a) and (b)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{(taxA.standardDeduction || 75000) + (taxA.professionTax || 0)}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={2}>6. Income chargeable under the head 'Salaries' (3-5)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxA.professionalIncome || 0}</td>
          </tr>
          <tr>
            <td colSpan={2}>Less: H.B.A Interest as per Rule 24(2)(vi)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxA.housingLoanInterest || 0}</td>
          </tr>
          <tr>
            <td colSpan={2}>7. Add: Any other income reported by the employee</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxA.totalOtherIncome || 0}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={2}>8. GROSS TOTAL INCOME (6+7)</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxA.grossTotalIncome || 0}</td>
          </tr>
        </tbody>
      </table>

      {/* Section 80C Deductions */}
      <div className="font-bold text-[11px] mt-2 mb-1 bg-gray-200 p-1">
        9. DEDUCTIONS UNDER CHAPTER VI-A
      </div>
      <table style={{ fontSize: '10px' }}>
        <tbody>
          <tr className="header-row">
            <td colSpan={4}>(A) Section 80C, 80CCC and 80CCD</td>
          </tr>
          <tr>
            <td className="w-8">(I)</td>
            <td>G.P.F / C.P.F</td>
            <td className="text-right w-10">RS.</td>
            <td className="amount-cell w-20">{(taxB.gpf || 0) + (taxB.cpf || 0)}</td>
          </tr>
          <tr>
            <td>(II)</td>
            <td>GOVT. GROUP</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.groupInsurance || 0}</td>
          </tr>
          <tr>
            <td>(III)</td>
            <td>L.I.C.</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.licPremium || 0}</td>
          </tr>
          <tr>
            <td>(IV)</td>
            <td>P.L.I</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.pliPremium || 0}</td>
          </tr>
          <tr>
            <td>(V)</td>
            <td>N.S.C.</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.nscInvestment || 0}</td>
          </tr>
          <tr>
            <td>(VI)</td>
            <td>EDUCATION FEE</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.educationFee || 0}</td>
          </tr>
          <tr>
            <td>(VII)</td>
            <td>HOME LOAN INS.</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.housingLoanPrincipal || 0}</td>
          </tr>
          <tr>
            <td>(VIII)</td>
            <td>S.B.I. LIFE / FD / SSY</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">{taxB.otherInvestment80C || 0}</td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td>Total (i) to (viii) [Section 80C]</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxB.max80C || 0}</td>
          </tr>
          <tr>
            <td>(B)</td>
            <td>Section 80CCC</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr>
            <td>(C)</td>
            <td>Section 80CCD</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr className="total-row">
            <td>(D)</td>
            <td>TOTAL: (A) to (C) [Section 80C, 80CCC, 80CCD]</td>
            <td className="text-right">RS.</td>
            <td className="amount-cell font-bold">{taxB.max80C || 0}</td>
          </tr>
        </tbody>
      </table>

      <div className="form-footer text-center text-[8px] mt-4 pt-2 border-t border-dashed border-gray-400">
        Created By: Smart Computer Vinchhiya 9924640689, 9574031243
      </div>
    </div>
  );
};

export default Form16A;
