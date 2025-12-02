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
    newData.totalIncome = (newData.bankInterest || 0) + (newData.nscInterest || 0) + 
                          (newData.examIncome || 0) + (newData.fdInterest || 0) + (newData.otherIncome || 0);
    newData.totalDeduction = (newData.licPremium || 0) + (newData.postInsurance || 0) + (newData.ppf || 0) + 
                             (newData.nscInvestment || 0) + (newData.housingLoanInterest || 0) + 
                             (newData.housingLoanPrincipal || 0) + (newData.educationFee || 0) + 
                             (newData.sbiLife || 0) + (newData.sukanyaSamridhi || 0) + 
                             (newData.medicalInsurance || 0) + (newData.fiveYearFD || 0) + (newData.otherDeduction || 0);

    onChange({ ...formData, declarationData: newData });
  };

  const InputCell = ({ field }: { field: keyof typeof formData.declarationData }) => (
    <td className="amount-cell">
      {readOnly ? (
        <span>{formData.declarationData[field] || 0}</span>
      ) : (
        <Input
          type="number"
          value={formData.declarationData[field] || ''}
          onChange={(e) => updateField(field, Number(e.target.value) || 0)}
          className="w-full h-6 text-xs text-right p-1 border-0 bg-transparent"
        />
      )}
    </td>
  );

  return (
    <div className="tax-form-container tax-form-print" id="declaration-form">
      <div className="text-center font-bold text-lg mb-1">ડેકલેરેશન ફોર્મ</div>
      <div className="text-center text-sm mb-3 font-bold">ઈન્કમટેક્ષ પરિશિષ્ટ મુજબ</div>

      {/* Declaration Text */}
      <div className="border border-black p-3 mb-4 text-[11px] leading-relaxed">
        <p className="mb-2">
          આથી હું <strong>{client.nameGujarati || client.name}</strong> પ્રતિજ્ઞાપૂર્વક જાહેર કરું છું
        </p>
        <p className="mb-2">
          વર્ષ: <strong>{formData.salaryData.financialYear}</strong> (તારીખ {formData.salaryData.accountingYear}) સુધીમાં
        </p>
        <p className="mb-2">
          દરમ્યાન મારી પગારદારી આવક સિવાયના અને પગાર બીલ કપાત કરાવેલ રકમ સિવાય મેં બારોબાર કપાત કરાવેલ કે કરાવવા માગું છું. 
          તે રકમની વિગત નીચે મુજબ છે. જે મારી જાણ અને સમજ મુજબ સાચી અને દોષરહિત છે.
        </p>
        <p>
          વધુમાં કપાત અંગેના જરૂરી આધારો હું ચાલુ નાણાકીય વર્ષની આખર તારીખ સુધીમાં શાળા કાર્યાલયમાં રજુ કરીશ અને 
          તેમ કરવામાં જો હું નિષ્ફળ જાઉં તો તે અંગેની સંપૂર્ણ જવાબદારી મારી રહેશે જેની હું ખાત્રી આપું છું.
        </p>
      </div>

      {/* Income and Deduction Table */}
      <table style={{ fontSize: '11px' }}>
        <thead>
          <tr className="header-row">
            <th className="w-8">ક્રમ</th>
            <th>આવક</th>
            <th className="w-20">રકમ રૂ.</th>
            <th className="w-8">ક્રમ</th>
            <th>કપાત</th>
            <th className="w-20">રકમ રૂ.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-center">1</td>
            <td>બેંક વ્યાજ (સેવિંગ્સ)</td>
            <InputCell field="bankInterest" />
            <td className="text-center">1</td>
            <td>જીવન વિમાનું પ્રિમિયમ</td>
            <InputCell field="licPremium" />
          </tr>
          <tr>
            <td className="text-center">2</td>
            <td>N.S.C. શ્રેણીનું વ્યાજ</td>
            <InputCell field="nscInterest" />
            <td className="text-center">2</td>
            <td>પોસ્ટ વિમાનું પ્રિમિયમ</td>
            <InputCell field="postInsurance" />
          </tr>
          <tr>
            <td className="text-center">3</td>
            <td>પરીક્ષાનું મહેનતાણું</td>
            <InputCell field="examIncome" />
            <td className="text-center">3</td>
            <td>P.P.F</td>
            <InputCell field="ppf" />
          </tr>
          <tr>
            <td className="text-center">4</td>
            <td>ફિકસ ડિપૉઝીટ વ્યાજ</td>
            <InputCell field="fdInterest" />
            <td className="text-center">4</td>
            <td>N.S.C ભરેલ રકમ</td>
            <InputCell field="nscInvestment" />
          </tr>
          <tr>
            <td className="text-center">5</td>
            <td></td>
            <td></td>
            <td className="text-center">5</td>
            <td>હાઉસીંગ બિલ્ડીંગ લોનનું વ્યાજ</td>
            <InputCell field="housingLoanInterest" />
          </tr>
          <tr>
            <td className="text-center">6</td>
            <td></td>
            <td></td>
            <td className="text-center">6</td>
            <td>હાઉસીંગ બિલ્ડીંગ લોનના હપ્તાની રકમ</td>
            <InputCell field="housingLoanPrincipal" />
          </tr>
          <tr>
            <td className="text-center">7</td>
            <td></td>
            <td></td>
            <td className="text-center">7</td>
            <td>શિક્ષણ ખર્ચ ટ્યુશન ફી</td>
            <InputCell field="educationFee" />
          </tr>
          <tr>
            <td className="text-center">8</td>
            <td></td>
            <td></td>
            <td className="text-center">8</td>
            <td>S.B.I.</td>
            <InputCell field="sbiLife" />
          </tr>
          <tr>
            <td className="text-center">9</td>
            <td></td>
            <td></td>
            <td className="text-center">9</td>
            <td>સુકન્યા સમૃદ્ધિ યોજના</td>
            <InputCell field="sukanyaSamridhi" />
          </tr>
          <tr>
            <td className="text-center">10</td>
            <td></td>
            <td></td>
            <td className="text-center">10</td>
            <td>મેડીકલેઇમમાં ભરેલ પ્રિમિયમ</td>
            <InputCell field="medicalInsurance" />
          </tr>
          <tr>
            <td className="text-center">11</td>
            <td></td>
            <td></td>
            <td className="text-center">11</td>
            <td>પંચ વર્ષીય ટાઇમમાં રોકાણ</td>
            <InputCell field="fiveYearFD" />
          </tr>
          <tr>
            <td className="text-center">12</td>
            <td></td>
            <td></td>
            <td className="text-center">12</td>
            <td>અન્ય</td>
            <InputCell field="otherDeduction" />
          </tr>
          <tr className="total-row">
            <td className="text-center">21</td>
            <td className="font-bold">કુલ</td>
            <td className="amount-cell font-bold">{formData.declarationData.totalIncome || 0}</td>
            <td className="text-center">21</td>
            <td className="font-bold">કુલ</td>
            <td className="amount-cell font-bold">{formData.declarationData.totalDeduction || 0}</td>
          </tr>
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="flex justify-between mt-6 text-[11px]">
        <div>
          <p className="mb-8">કર્મચારીની સહી</p>
          <p>હોદ્દો: {client.designationGujarati || client.designation || '-'}</p>
          <p>સ્થળ: {client.schoolNameGujarati || client.schoolName || '-'}</p>
          <p>તારીખ: _______________</p>
        </div>
        <div className="text-right">
          <p className="mb-8">સંસ્થાના વડાની સહી</p>
          <p>સિક્કો</p>
          <p>તારીખ: _______________</p>
        </div>
      </div>

      <div className="text-center text-[8px] mt-4 pt-2 border-t border-dashed border-gray-400">
        Created By: Smart Computer Vinchhiya - Rupsangbhai Jamod - 9924640689
      </div>
    </div>
  );
};

export default DeclarationForm;
