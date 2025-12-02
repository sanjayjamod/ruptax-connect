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
      <div className="form-title">FORM 16 SEE RULES 31(1)(A)</div>
      <p className="text-center text-xs mb-4">
        Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source from income chargeable under the head "Salaries"
      </p>

      {/* Header Info */}
      <table className="mb-4">
        <tbody>
          <tr>
            <td className="label-cell w-1/2">Name And Address of the employer</td>
            <td className="label-cell w-1/2">Name And Designation of the employee</td>
          </tr>
          <tr>
            <td>{form16.employerName}</td>
            <td className="font-bold">{client.name}</td>
          </tr>
          <tr>
            <td>{client.payCenterName}</td>
            <td>{client.designation}</td>
          </tr>
          <tr>
            <td>{client.payCenterAddress}</td>
            <td>{client.schoolAddress}</td>
          </tr>
          <tr>
            <td>PIN :- {client.place ? "360055" : ""}</td>
            <td>{client.place}</td>
          </tr>
          <tr>
            <td>PAN/GLR No: {form16.employerPan}</td>
            <td>PAN/NO.: {client.panNo}</td>
          </tr>
          <tr>
            <td>TAN: {form16.employerTan}</td>
            <td>ASSESSMENT YEAR: {client.assessmentYear}</td>
          </tr>
          <tr>
            <td colSpan={2}>
              TDS Circle where Annual Return/Statement under section 206 is to be filed
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              PERIOD: FROM {formData.salaryData.accountingYear}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Quarterly Acknowledgement */}
      <table className="mb-4">
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
            <td>Apr-22</td>
            <td>Jun-22</td>
          </tr>
          <tr>
            <td>Quarter-2</td>
            <td>{form16.quarters.q2.acknowledgementNo}</td>
            <td>Jul-22</td>
            <td>Sep-22</td>
          </tr>
          <tr>
            <td>Quarter-3</td>
            <td>{form16.quarters.q3.acknowledgementNo}</td>
            <td>Oct-22</td>
            <td>Dec-22</td>
          </tr>
          <tr>
            <td>Quarter-4</td>
            <td>{form16.quarters.q4.acknowledgementNo}</td>
            <td>Jan-23</td>
            <td>Mar-23</td>
          </tr>
        </tbody>
      </table>

      {/* Salary Details */}
      <div className="section-title">DETAILS OF SALARY PAID AND ANY OTHER INCOME AND TAX DEDUCTED</div>
      <table>
        <tbody>
          <tr>
            <td colSpan={2}>1. Gross Salary</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(a) Salary as per provisions Contained in section 17(1)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxA.grossSalary}</td>
          </tr>
          <tr>
            <td></td>
            <td>(b) Value of perquisites u/s 17(2)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr>
            <td></td>
            <td>(c) Profits in lieu of salary under section 17(3)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td>(d) TOTAL</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.grossSalary}</td>
          </tr>
          <tr>
            <td colSpan={2}>2. Less: Allowance to the extent exempt under section 10</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxA.totalExempt}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={2}>3. BALANCE (1-2)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.balanceSalary || taxA.grossSalary}</td>
          </tr>
          <tr>
            <td colSpan={2}>4. DEDUCTIONS:</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>(a) Standard Deduction</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxA.standardDeduction}</td>
          </tr>
          <tr>
            <td></td>
            <td>(b) Tax on Employment</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxA.professionTax}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={2}>5. Aggregate of 4(a) and (b)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.standardDeduction + taxA.professionTax}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={2}>6. Income chargeable under the head 'Salaries' (3-5)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.professionalIncome}</td>
          </tr>
          <tr>
            <td colSpan={2}>Less: H.B.A Interest as per Rule 24(2)(vi)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxA.housingLoanInterest}</td>
          </tr>
          <tr>
            <td colSpan={2}>7. Add: Any other income reported by the employee</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxA.totalOtherIncome}</td>
          </tr>
          <tr className="total-row">
            <td colSpan={2}>8. GROSS TOTAL INCOME (6+7)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxA.grossTotalIncome}</td>
          </tr>
        </tbody>
      </table>

      {/* Section 80C Deductions */}
      <div className="section-title">9. DEDUCTIONS UNDER CHAPTER VI-A</div>
      <table>
        <tbody>
          <tr className="header-row">
            <td colSpan={4}>(A) Section 80C, 80CCC and 80CCD</td>
          </tr>
          <tr>
            <td>(i)</td>
            <td>G.P.F / C.P.F</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.gpf + taxB.cpf}</td>
          </tr>
          <tr>
            <td>(ii)</td>
            <td>GOVT. GROUP</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.groupInsurance}</td>
          </tr>
          <tr>
            <td>(iii)</td>
            <td>L.I.C.</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.licPremium}</td>
          </tr>
          <tr>
            <td>(iv)</td>
            <td>P.L.I</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.pliPremium}</td>
          </tr>
          <tr>
            <td>(v)</td>
            <td>N.S.C.</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.nscInvestment}</td>
          </tr>
          <tr>
            <td>(vi)</td>
            <td>EDUCATION FEE</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.educationFee}</td>
          </tr>
          <tr>
            <td>(vii)</td>
            <td>HOME LOAN INS.</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.housingLoanPrincipal}</td>
          </tr>
          <tr>
            <td>(viii)</td>
            <td>S.B.I. LIFE / FD / SSY</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">{taxB.otherInvestment80C}</td>
          </tr>
          <tr className="total-row">
            <td></td>
            <td>Total (Section 80C)</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxB.max80C}</td>
          </tr>
          <tr>
            <td>(B)</td>
            <td>Section 80CCC</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr>
            <td>(C)</td>
            <td>Section 80CCD</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell">0</td>
          </tr>
          <tr className="total-row">
            <td>(D)</td>
            <td>TOTAL: (A) to (C) [Section 80C, 80CCC, 80CCD]</td>
            <td className="amount-cell">RS.</td>
            <td className="amount-cell font-bold">{taxB.max80C}</td>
          </tr>
        </tbody>
      </table>

      <div className="footer-note">
        Created By: Smart Computer Vinchhiya - Rupsangbhai Jamod-9924640689
      </div>
    </div>
  );
};

export default Form16A;
