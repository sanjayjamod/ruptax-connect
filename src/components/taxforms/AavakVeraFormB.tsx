import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import EditableLabel from "./EditableLabel";
import "./PrintStyles.css";

interface AavakVeraFormBProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
  isManualMode?: boolean;
  isTextEditMode?: boolean;
}

const AavakVeraFormB = ({ client, formData, onChange, readOnly = false, isManualMode = false, isTextEditMode = false }: AavakVeraFormBProps) => {
  const taxB = formData.taxCalculationB;

  const updateField = (field: keyof typeof formData.taxCalculationB, value: number | string) => {
    onChange({
      ...formData,
      taxCalculationB: { ...formData.taxCalculationB, [field]: value },
    });
  };

  const renderManualInputField = (field: keyof typeof taxB, value: number) => (
    readOnly ? (
      <span>{value || 0}</span>
    ) : (
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        defaultValue={value || ''}
        onBlur={(e) => updateField(field, Number(e.target.value) || 0)}
        className="w-full h-6 text-right p-0 border-0 bg-yellow-100 inline-block focus:outline-none focus:bg-yellow-200 print:bg-transparent"
        style={{ fontSize: '11pt' }}
        title="Manual Input"
      />
    )
  );

  const renderAutoField = (value: number) => (
    <span className="font-medium">{value || 0}</span>
  );

  // Editable label helper
  const EL = ({ id, text, className = "" }: { id: string; text: string; className?: string }) => (
    <EditableLabel id={`formB_${id}`} defaultText={text} isEditMode={isTextEditMode} className={className} />
  );

  return (
    <div className="tax-form-container tax-form-print page-break aavak-vera-form" id="aavak-vera-form-b">
      {/* Main Title - 18pt */}
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td colSpan={8} className="text-center font-bold border border-black py-2" style={{ fontSize: '18pt' }}>
              <EL id="title" text="આવક વેરા ગણતરી ફોર્મ" />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Section D - Deductions - 13pt header, 11pt content */}
      <table className="w-full border-collapse mt-1" style={{ fontSize: '11pt' }}>
        <tbody>
          <tr>
            <td colSpan={8} className="border border-black px-2 py-1 font-bold bg-gray-100" style={{ fontSize: '13pt' }}>
              <EL id="sectionD" text="વિભાગ (D) સમગ્ર કુલ આવક માંથી કલમ મુજબ બાદ મળતર વિભાગ" />
            </td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">1</td>
            <td colSpan={3} className="border border-black px-2 py-1 font-bold"><EL id="section80c" text="Under section 80-C," /></td>
            <td colSpan={4} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(i)</td>
            <td colSpan={2} className="border border-black px-2 py-1">જી.પી.એફ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.gpf)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(ii)</td>
            <td colSpan={2} className="border border-black px-2 py-1">સી.પી.એફ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.cpf)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(iii)</td>
            <td colSpan={2} className="border border-black px-2 py-1">એલ.આઈ.સી. પ્રીમિયમ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.licPremium)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(iv)</td>
            <td colSpan={2} className="border border-black px-2 py-1">પી.એલ.ઈ\આઈ.પ્રીમિયમ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.pliPremium)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(v)</td>
            <td colSpan={2} className="border border-black px-2 py-1">જૂથ વીમો</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.groupInsurance)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(vi)</td>
            <td colSpan={2} className="border border-black px-2 py-1">પી.પી.એફ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.ppf)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(vii)</td>
            <td colSpan={2} className="border border-black px-2 py-1">એન.એસ.સી.માં કરેલ રોકાણ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.nscInvestment)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(viii)</td>
            <td colSpan={2} className="border border-black px-2 py-1">મકાન લોનના હપ્તાની રકમ ( મુદ્દલ )</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.housingLoanPrincipal)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(ix)</td>
            <td colSpan={2} className="border border-black px-2 py-1">બાળકોની શિક્ષણ ફિ ચુકવેલ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.educationFee)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1">(x)</td>
            <td colSpan={2} className="border border-black px-2 py-1">અન્ય રોકાણ ૮૦ સી મુજબ મ્યુ ફંડ, S.B.I. LIFE,F.D</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.otherInvestment80C)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={2} className="border border-black px-2 py-1 font-bold">કુલ રોકાણ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxB.total80C)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={2} className="border border-black px-2 py-1 font-bold">૧૫૦૦૦૦ની મર્યાદામાં</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxB.max80C)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">2</td>
            <td colSpan={3} className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">મેડીકલેઇમ 80-D,(Upto Rs.25000)</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("medicalInsurance80D", taxB.medicalInsurance80D)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">3</td>
            <td colSpan={3} className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">વિકલાંગ આશ્રિત માટેના તબીબ ખર્ચ 80-DD,(Upto Rs.50000)</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("disabledDependent80DD", taxB.disabledDependent80DD)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">4</td>
            <td colSpan={3} className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">કેન્સર જેવા ગંભીર રોગ માટે કરેલ તબીબ ખર્ચ 80-DDB,(Upto Rs.40000)</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("seriousDisease80DDB", taxB.seriousDisease80DDB)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">5</td>
            <td colSpan={3} className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">અંધ અપંગને મળતી ખાસ કપાત 80-U,(75000 TO 125000 )</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("disability80U", taxB.disability80U)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">6</td>
            <td colSpan={3} className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">દાનમાં આપેલ મળવા પાત્ર રકમ 80-G Rs.</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("donation80G", taxB.donation80G)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">7</td>
            <td colSpan={3} className="border border-black px-2 py-1 bg-yellow-50 print:bg-transparent">સવિંગ બેંક વ્યાજ Rs. 10,000 ની મર્યાદામાં 80TTA</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right bg-yellow-100 print:bg-transparent">{renderManualInputField("savingsBankInterest80TTA", taxB.savingsBankInterest80TTA)}</td>
            <td colSpan={2} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">8</td>
            <td colSpan={3} className="border border-black px-2 py-1 font-bold">રોકાણ બાદ મળવા પાત્ર રકમનો સરવાળો Didision(D)</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxB.totalDeductions)}</td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">9</td>
            <td colSpan={3} className="border border-black px-2 py-1 font-bold">બાકિ મળવા પાત્ર આવક less income [division: C(3)-division:D(7)]</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxB.taxableIncome)}</td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">10</td>
            <td colSpan={3} className="border border-black px-2 py-1 font-bold">દશનાં રાઉન્ડમાં કરપાત્ર રકમ Remaining Amount rounded to Rs.10/-(ten)</td>
            <td className="border border-black px-2 py-1"></td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxB.roundedTaxableIncome)}</td>
            <td className="border border-black px-2 py-1"></td>
          </tr>
        </tbody>
      </table>

      {/* Tax Slabs Table - 10pt */}
      <table className="w-full border-collapse mt-1" style={{ fontSize: '10pt' }}>
        <tbody>
          <tr>
            <td className="border border-black px-2 py-1">1</td>
            <td colSpan={2} className="border border-black px-2 py-1">Upto Rs 400000/male- & Female Rs. 400000</td>
            <td className="border border-black px-2 py-1 text-center">0%</td>
            <td className="border border-black px-2 py-1 text-right">400000</td>
            <td className="border border-black px-2 py-1 text-right">{Math.min(taxB.roundedTaxableIncome || 0, 400000)}</td>
            <td className="border border-black px-2 py-1 text-right">0</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">2</td>
            <td colSpan={2} className="border border-black px-2 py-1">Rs 400001 To 800,000</td>
            <td className="border border-black px-2 py-1 text-center">5%</td>
            <td className="border border-black px-2 py-1 text-right">400000</td>
            <td className="border border-black px-2 py-1 text-right">{Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 400000), 400000)}</td>
            <td className="border border-black px-2 py-1 text-right">{Math.round(Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 400000), 400000) * 0.05)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">3</td>
            <td colSpan={2} className="border border-black px-2 py-1">Rs8,00,001 To 12,00,000</td>
            <td className="border border-black px-2 py-1 text-center">10%</td>
            <td className="border border-black px-2 py-1 text-right">400000</td>
            <td className="border border-black px-2 py-1 text-right">{Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 800000), 400000)}</td>
            <td className="border border-black px-2 py-1 text-right">Rs.{Math.round(Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 800000), 400000) * 0.10)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={2} className="border border-black px-2 py-1">Rs 1200001 To 16,00,000</td>
            <td className="border border-black px-2 py-1 text-center">15%</td>
            <td className="border border-black px-2 py-1 text-right">400000</td>
            <td className="border border-black px-2 py-1 text-right">{Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 1200000), 400000)}</td>
            <td className="border border-black px-2 py-1 text-right">{Math.round(Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 1200000), 400000) * 0.15)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={2} className="border border-black px-2 py-1">Rs.16,00,001 To 20,00,000</td>
            <td className="border border-black px-2 py-1 text-center">20%</td>
            <td className="border border-black px-2 py-1 text-right">400000</td>
            <td className="border border-black px-2 py-1 text-right">{Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 1600000), 400000)}</td>
            <td className="border border-black px-2 py-1 text-right">{Math.round(Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 1600000), 400000) * 0.20)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={2} className="border border-black px-2 py-1">Rs.20,00,001 To 24,00,000</td>
            <td className="border border-black px-2 py-1 text-center">25%</td>
            <td className="border border-black px-2 py-1 text-right">400000</td>
            <td className="border border-black px-2 py-1 text-right">{Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 2000000), 400000)}</td>
            <td className="border border-black px-2 py-1 text-right">{Math.round(Math.min(Math.max(0, (taxB.roundedTaxableIncome || 0) - 2000000), 400000) * 0.25)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={2} className="border border-black px-2 py-1">UP TO .. Rs.24,00,001</td>
            <td className="border border-black px-2 py-1 text-center">30%</td>
            <td className="border border-black px-2 py-1 text-right">-</td>
            <td className="border border-black px-2 py-1 text-right">{Math.max(0, (taxB.roundedTaxableIncome || 0) - 2400000)}</td>
            <td className="border border-black px-2 py-1 text-right">{Math.round(Math.max(0, (taxB.roundedTaxableIncome || 0) - 2400000) * 0.30)}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax Summary - 11pt */}
      <table className="w-full border-collapse mt-1" style={{ fontSize: '11pt' }}>
        <tbody>
          <tr>
            <td colSpan={4} className="border border-black px-2 py-1 font-bold bg-gray-100">TOTAL AMOUNT OF TAX AS PER DIVISION:</td>
            <td colSpan={4} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-2 py-1 font-bold bg-gray-100">ADJUSTMENT OF INCOME TAX</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={4} className="border border-black px-2 py-1">ભરવાપાત્ર ઇન્કમટેક્ષ Amount of income - Tax</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxB.totalTax)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={4} className="border border-black px-2 py-1">Amount elligible for Tax rebate Section 87 A Up To Rs .60000</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.taxRebate87A)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={4} className="border border-black px-2 py-1">ટેક્ષ રિબેટ બાદ ભરવા પાત્ર ઇન્કમટેક્ષ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxB.taxAfterRebate)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={4} className="border border-black px-2 py-1">Marginal relief 1275000 To 1335000 સુધીની આવક માટે</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.marginalRelief || 0)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={4} className="border border-black px-2 py-1">Marginal relief બાદ કરતા ભરવા પાત્ર ઈન્કમટેક્ષ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxB.taxAfterMarginalRelief || taxB.taxAfterRebate)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={4} className="border border-black px-2 py-1">એજયુકેશન સેસ Edu cess 4%</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.educationCess)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={4} className="border border-black px-2 py-1 font-bold">કુલ ભરવા પાત્ર ઈન્કમટેક્ષ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxB.totalTaxPayable)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={7} className="border border-black px-2 py-1"></td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={4} className="border border-black px-2 py-1 font-bold">કુલ ભરવાપાત્ર ઇન્કમટેક્સ Net Amount of Income tax</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxB.netTaxPayable)}</td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-2 py-1 font-bold bg-gray-100">ઇન્કમટેક્ષની વિગત (પગારમાંથીભરેલ તથા ભરવા પાત્ર )</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">1</td>
            <td colSpan={4} className="border border-black px-2 py-1">ભરપાઈ કરેલ ઇન્કમટેક્ષ</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.taxPaid)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">2</td>
            <td colSpan={4} className="border border-black px-2 py-1">ભરવાપાત્ર બાકિ રહેલ ટેક્ષની રકમ To Recoverd form pay of</td>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.balanceTax)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">3</td>
            <td colSpan={4} className="border border-black px-2 py-1">Recovered from pay of FEB-2026 paid March 2026</td>
            <td className="border border-black px-2 py-1 text-right">Rs.</td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right">{renderAutoField(taxB.balanceTax)}</td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-1">4</td>
            <td colSpan={4} className="border border-black px-2 py-1 font-bold">કુલ ભરપાઈ કરેલ ઇન્કમટેક્ષની રકમ Total Income tax paid</td>
            <td className="border border-black px-2 py-1"></td>
            <td colSpan={2} className="border border-black px-2 py-1 text-right font-bold">{renderAutoField(taxB.netTaxPayable)}</td>
          </tr>
        </tbody>
      </table>

      {/* Certification - 10pt */}
      <table className="w-full border-collapse mt-1" style={{ fontSize: '10pt' }}>
        <tbody>
          <tr>
            <td colSpan={8} className="border border-black px-2 py-1 font-bold">કર્મચારી ( શિક્ષક ) બાહેંધરી</td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-2 py-2">
              આ પત્રકમાં ભરેલ તમામ વિગતો સાચી અને દોષ રહિત છે.જેની આથી હું ખાત્રી આપું છું. 
              <span className="float-right">સહિ</span>
            </td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-2 py-1 font-bold">સસ્થાના વડાનું પ્રમાણપત્ર</td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-2 py-2">
              આ પત્રકમાં ભરેલ તમામ પગારદાર વિગતો સસ્થાના હિસાબી દફતરે પ્રમાણે અને રોકાણોના આધારો અત્રેની ઓફિસમાંકર્મચારીએ રાખેલ છે.
            </td>
          </tr>
          <tr>
            <td colSpan={8} className="border border-black px-2 py-1">
              જેની આથી હું ખાત્રી આપું છું.
            </td>
          </tr>
          <tr>
            <td colSpan={4} className="border border-black px-2 py-3"></td>
            <td colSpan={4} className="border border-black px-2 py-3 text-right">Signature and seal of Head of office</td>
          </tr>
        </tbody>
      </table>

      {/* Footer - 10pt */}
      <div className="form-footer text-center mt-2 pt-2" style={{ fontSize: '10pt' }}>
        Developed by - Smart Computer - 9924640689 ,9574031243
      </div>
    </div>
  );
};

export default AavakVeraFormB;
