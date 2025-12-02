import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import { Input } from "@/components/ui/input";
import "./PrintStyles.css";

interface DeclarationFormProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
}

const DeclarationForm = ({ client, formData, onChange, readOnly = false }: DeclarationFormProps) => {
  const updateField = (field: keyof typeof formData.declarationData, value: number) => {
    const newData = { ...formData.declarationData, [field]: value };
    
    // Calculate totals
    newData.totalIncome = newData.bankInterest + newData.nscInterest + newData.examIncome + newData.fdInterest + newData.otherIncome;
    newData.totalDeduction = newData.licPremium + newData.postInsurance + newData.ppf + newData.nscInvestment + 
      newData.housingLoanInterest + newData.housingLoanPrincipal + newData.educationFee + newData.sbiLife + 
      newData.sukanyaSamridhi + newData.medicalInsurance + newData.fiveYearFD + newData.otherDeduction;

    onChange({ ...formData, declarationData: newData });
  };

  const InputCell = ({ field }: { field: keyof typeof formData.declarationData }) => (
    <td className="amount-cell">
      <Input
        type="number"
        value={formData.declarationData[field] || ''}
        onChange={(e) => updateField(field, Number(e.target.value) || 0)}
        className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
        disabled={readOnly}
      />
    </td>
  );

  return (
    <div className="tax-form-container tax-form-print" id="declaration-form">
      <div className="form-title gujarati-text">ડેકલેરેશન ફોર્મ</div>
      <p className="text-center text-sm mb-4 gujarati-text">ઈન્કમટેક્ષ પરિશિષ્ટ મુજબ</p>

      {/* Declaration Text */}
      <div className="border border-gray-400 p-3 mb-4 text-sm gujarati-text">
        <p>
          આથી હું <strong>{client.nameGujarati || client.name}</strong> પ્રતિજ્ઞાપૂર્વક જાહેર કરું છું
        </p>
        <p>
          વર્ષ: <strong>{formData.salaryData.financialYear}</strong> (તારીખ {formData.salaryData.accountingYear}) સુધીમા
        </p>
        <p>
          દરમ્યાન મારી પગારદારી આવક સિવાયના અને પગાર બીલ કપાત કરાવેલ રકમ સિવાય મેં
          બારોબાર કપાત કરાવેલ કે કરાવવા માગું છું. તે રકમની વિગત નીચે મુજબ છે. જે મારી જાણ
          અને સમજ મુજબ સાચી અને દોષરહિત છે.
        </p>
        <p>
          વધુમા કપાત અંગેના જરૂરી આધારો હું ચાલુ નાણાકીય વર્ષની આખર તારીખ સુધીમાં શાળા કાર્યાલય
          માં રજુ કરીશ અને તેમ કરવામાં જો હું નિષ્ફળ જાઉં તો તે અંગેની સંપુર્ણ જવાબદારી મારી રહેશે જેની
          હું ખાત્રી આપું છું.
        </p>
      </div>

      {/* Income and Deduction Table */}
      <table>
        <thead>
          <tr className="header-row">
            <th className="w-10 gujarati-text">ક્રમ</th>
            <th className="gujarati-text">આવક</th>
            <th className="w-24 gujarati-text">રકમ રૂ.</th>
            <th className="w-10 gujarati-text">ક્રમ</th>
            <th className="gujarati-text">કપાત</th>
            <th className="w-24 gujarati-text">રકમ રૂ.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-center">1</td>
            <td className="gujarati-text">બેન્ક વ્યાજ (સેવિગ્સ)</td>
            <InputCell field="bankInterest" />
            <td className="text-center">1</td>
            <td className="gujarati-text">જીવન વિમાનું પ્રિમિયમ</td>
            <InputCell field="licPremium" />
          </tr>
          <tr>
            <td className="text-center">2</td>
            <td className="gujarati-text">N.S.C. શ્રેણીનું વ્યાજ</td>
            <InputCell field="nscInterest" />
            <td className="text-center">2</td>
            <td className="gujarati-text">પોસ્ટ વિમાનું પ્રિમિયમ</td>
            <InputCell field="postInsurance" />
          </tr>
          <tr>
            <td className="text-center">3</td>
            <td className="gujarati-text">પરીક્ષાનું મહેનતાણું</td>
            <InputCell field="examIncome" />
            <td className="text-center">3</td>
            <td className="gujarati-text">P.P.F</td>
            <InputCell field="ppf" />
          </tr>
          <tr>
            <td className="text-center">4</td>
            <td className="gujarati-text">ફિકસ ડિપૉજીટ વ્યાજ</td>
            <InputCell field="fdInterest" />
            <td className="text-center">4</td>
            <td className="gujarati-text">N.S.C ભરેલ રકમ</td>
            <InputCell field="nscInvestment" />
          </tr>
          <tr>
            <td className="text-center">5</td>
            <td className="gujarati-text">અન્ય આવક</td>
            <InputCell field="otherIncome" />
            <td className="text-center">5</td>
            <td className="gujarati-text">હાઉસીગ બિલ્ડીંગ લોનનુ વ્યાજ</td>
            <InputCell field="housingLoanInterest" />
          </tr>
          <tr>
            <td className="text-center">6</td>
            <td></td>
            <td></td>
            <td className="text-center">6</td>
            <td className="gujarati-text">હાઉસીંગ બિલ્ડીગ લોનના હપતાની રકમ</td>
            <InputCell field="housingLoanPrincipal" />
          </tr>
          <tr>
            <td className="text-center">7</td>
            <td></td>
            <td></td>
            <td className="text-center">7</td>
            <td className="gujarati-text">શિક્ષણ ખર્ચ ટ્યુશન ફી</td>
            <InputCell field="educationFee" />
          </tr>
          <tr>
            <td className="text-center">8</td>
            <td></td>
            <td></td>
            <td className="text-center">8</td>
            <td className="gujarati-text">S.B.I. Life / FD</td>
            <InputCell field="sbiLife" />
          </tr>
          <tr>
            <td className="text-center">9</td>
            <td></td>
            <td></td>
            <td className="text-center">9</td>
            <td className="gujarati-text">સુકન્યા સમૃધિ યોજના</td>
            <InputCell field="sukanyaSamridhi" />
          </tr>
          <tr>
            <td className="text-center">10</td>
            <td></td>
            <td></td>
            <td className="text-center">10</td>
            <td className="gujarati-text">મેડીકલેઇમમાં ભરેલ પ્રિમિયમ</td>
            <InputCell field="medicalInsurance" />
          </tr>
          <tr>
            <td className="text-center">11</td>
            <td></td>
            <td></td>
            <td className="text-center">11</td>
            <td className="gujarati-text">પંચ વર્ષીય ટાઇમમાં રોકાણ</td>
            <InputCell field="fiveYearFD" />
          </tr>
          <tr>
            <td className="text-center">12</td>
            <td></td>
            <td></td>
            <td className="text-center">12</td>
            <td className="gujarati-text">અન્ય</td>
            <InputCell field="otherDeduction" />
          </tr>
          <tr className="total-row">
            <td className="text-center">21</td>
            <td className="gujarati-text font-bold">કુલ</td>
            <td className="amount-cell font-bold">{formData.declarationData.totalIncome}</td>
            <td className="text-center">21</td>
            <td className="gujarati-text font-bold">કુલ</td>
            <td className="amount-cell font-bold">{formData.declarationData.totalDeduction}</td>
          </tr>
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="signature-box mt-8">
        <div className="signature-item">
          <div className="signature-line gujarati-text">કર્મચારીની સહી</div>
          <p className="mt-2 gujarati-text">હોદો: {client.designationGujarati || client.designation}</p>
          <p className="gujarati-text">સ્થળ: {client.schoolNameGujarati || client.schoolName}</p>
          <p className="gujarati-text">તારીખ: _______________</p>
        </div>
        <div className="signature-item">
          <div className="signature-line gujarati-text">સંસ્થાના વડાની સહી</div>
          <p className="mt-2 gujarati-text">સિક્કો</p>
          <p className="gujarati-text">તારીખ: _______________</p>
        </div>
      </div>

      <div className="footer-note">
        Created By: Smart Computer Vinchhiya - Rupsangbhai Jamod-9924640689
      </div>
    </div>
  );
};

export default DeclarationForm;
