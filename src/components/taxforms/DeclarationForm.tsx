import { Client } from "@/types/client";
import { TaxFormData } from "@/types/taxForm";
import "./PrintStyles.css";

interface DeclarationFormProps {
  client: Client;
  formData: TaxFormData;
  onChange: (data: TaxFormData) => void;
  readOnly?: boolean;
  isManualMode?: boolean;
}

const DeclarationForm = ({ client, formData, onChange, readOnly = false, isManualMode = false }: DeclarationFormProps) => {
  const updateField = (field: keyof typeof formData.declarationData, value: number) => {
    const newData = { ...formData.declarationData, [field]: value };
    
    // Calculate totals (unless in manual mode and editing total fields)
    if (!isManualMode || (field !== 'totalIncome' && field !== 'totalDeduction')) {
      newData.totalIncome = (newData.bankInterest || 0) + (newData.nscInterest || 0) + 
                            (newData.examIncome || 0) + (newData.fdInterest || 0) + (newData.otherIncome || 0);
      newData.totalDeduction = (newData.licPremium || 0) + (newData.postInsurance || 0) + (newData.ppf || 0) + 
                               (newData.nscInvestment || 0) + (newData.housingLoanInterest || 0) + 
                               (newData.housingLoanPrincipal || 0) + (newData.educationFee || 0) + 
                               (newData.sbiLife || 0) + (newData.sukanyaSamridhi || 0) + 
                               (newData.medicalInsurance || 0) + (newData.fiveYearFD || 0) + (newData.otherDeduction || 0);
    }

    onChange({ ...formData, declarationData: newData });
  };

  const updateTextField = (field: 'employeeSignatureLabel' | 'designationLabel' | 'placeLabel' | 'institutionHeadLabel' | 'stampLabel', value: string) => {
    onChange({
      ...formData,
      declarationData: { ...formData.declarationData, [field]: value }
    });
  };

  // Manual input cell - yellow background
  const renderManualInputCell = (field: keyof typeof formData.declarationData) => (
    <td className="amount-cell">
      {readOnly ? (
        <span>{formData.declarationData[field] || 0}</span>
      ) : (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          defaultValue={formData.declarationData[field] || ''}
          onBlur={(e) => updateField(field, Number(e.target.value) || 0)}
          className="w-full h-6 text-xs text-right p-1 border-0 bg-yellow-100 focus:outline-none focus:bg-yellow-200 print:bg-transparent"
          title="Manual Input / હાથે ભરો"
        />
      )}
    </td>
  );

  // Auto-calculated cell
  const renderAutoCell = (value: number, field?: keyof typeof formData.declarationData) => (
    <td className="amount-cell font-bold bg-gray-50 print:bg-transparent">
      {isManualMode && !readOnly && field ? (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          defaultValue={value || ''}
          onBlur={(e) => updateField(field, Number(e.target.value) || 0)}
          className="w-full h-6 text-xs text-right p-1 border-0 bg-blue-50 focus:outline-none focus:bg-blue-100 print:bg-transparent"
          title="Manual Override / હાથે ભરો"
        />
      ) : (
        <span className="text-blue-800">{value || 0}</span>
      )}
    </td>
  );

  return (
    <div className="tax-form-container tax-form-print" id="declaration-form">
      <div className="text-center font-bold text-lg mb-1">ડેકલેરેશન ફોર્મ</div>
      <div className="text-center text-sm mb-3 font-bold">ઈન્કમટેક્ષ પરિશિષ્ટ મુજબ</div>

      {/* Mode Indicator */}
      {!readOnly && (
        <div className="flex items-center gap-4 mb-2 text-[10px] no-print">
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-yellow-100 border border-yellow-300"></span>
            <span>Manual Input / હાથે ભરો</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-4 h-4 bg-gray-50 border border-gray-300"></span>
            <span className="text-blue-800">Auto Calculated / ઓટો ગણતરી</span>
          </div>
        </div>
      )}

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
            <td className="bg-yellow-50 print:bg-transparent">બેંક વ્યાજ (સેવિંગ્સ)</td>
            {renderManualInputCell("bankInterest")}
            <td className="text-center">1</td>
            <td className="bg-yellow-50 print:bg-transparent">જીવન વિમાનું પ્રિમિયમ</td>
            {renderManualInputCell("licPremium")}
          </tr>
          <tr>
            <td className="text-center">2</td>
            <td className="bg-yellow-50 print:bg-transparent">N.S.C. શ્રેણીનું વ્યાજ</td>
            {renderManualInputCell("nscInterest")}
            <td className="text-center">2</td>
            <td className="bg-yellow-50 print:bg-transparent">પોસ્ટ વિમાનું પ્રિમિયમ</td>
            {renderManualInputCell("postInsurance")}
          </tr>
          <tr>
            <td className="text-center">3</td>
            <td className="bg-yellow-50 print:bg-transparent">પરીક્ષાનું મહેનતાણું</td>
            {renderManualInputCell("examIncome")}
            <td className="text-center">3</td>
            <td className="bg-yellow-50 print:bg-transparent">P.P.F</td>
            {renderManualInputCell("ppf")}
          </tr>
          <tr>
            <td className="text-center">4</td>
            <td className="bg-yellow-50 print:bg-transparent">ફિકસ ડિપૉઝીટ વ્યાજ</td>
            {renderManualInputCell("fdInterest")}
            <td className="text-center">4</td>
            <td className="bg-yellow-50 print:bg-transparent">N.S.C ભરેલ રકમ</td>
            {renderManualInputCell("nscInvestment")}
          </tr>
          <tr>
            <td className="text-center">5</td>
            <td></td>
            <td></td>
            <td className="text-center">5</td>
            <td className="bg-yellow-50 print:bg-transparent">હાઉસીંગ બિલ્ડીંગ લોનનું વ્યાજ</td>
            {renderManualInputCell("housingLoanInterest")}
          </tr>
          <tr>
            <td className="text-center">6</td>
            <td></td>
            <td></td>
            <td className="text-center">6</td>
            <td className="bg-yellow-50 print:bg-transparent">હાઉસીંગ બિલ્ડીંગ લોનના હપ્તાની રકમ</td>
            {renderManualInputCell("housingLoanPrincipal")}
          </tr>
          <tr>
            <td className="text-center">7</td>
            <td></td>
            <td></td>
            <td className="text-center">7</td>
            <td className="bg-yellow-50 print:bg-transparent">શિક્ષણ ખર્ચ ટ્યુશન ફી</td>
            {renderManualInputCell("educationFee")}
          </tr>
          <tr>
            <td className="text-center">8</td>
            <td></td>
            <td></td>
            <td className="text-center">8</td>
            <td className="bg-yellow-50 print:bg-transparent">S.B.I.</td>
            {renderManualInputCell("sbiLife")}
          </tr>
          <tr>
            <td className="text-center">9</td>
            <td></td>
            <td></td>
            <td className="text-center">9</td>
            <td className="bg-yellow-50 print:bg-transparent">સુકન્યા સમૃદ્ધિ યોજના</td>
            {renderManualInputCell("sukanyaSamridhi")}
          </tr>
          <tr>
            <td className="text-center">10</td>
            <td></td>
            <td></td>
            <td className="text-center">10</td>
            <td className="bg-yellow-50 print:bg-transparent">મેડીકલેઇમમાં ભરેલ પ્રિમિયમ</td>
            {renderManualInputCell("medicalInsurance")}
          </tr>
          <tr>
            <td className="text-center">11</td>
            <td></td>
            <td></td>
            <td className="text-center">11</td>
            <td className="bg-yellow-50 print:bg-transparent">પંચ વર્ષીય ટાઇમમાં રોકાણ</td>
            {renderManualInputCell("fiveYearFD")}
          </tr>
          <tr>
            <td className="text-center">12</td>
            <td></td>
            <td></td>
            <td className="text-center">12</td>
            <td className="bg-yellow-50 print:bg-transparent">અન્ય</td>
            {renderManualInputCell("otherDeduction")}
          </tr>
          <tr className="total-row">
            <td className="text-center">21</td>
            <td className="font-bold">કુલ</td>
            {renderAutoCell(formData.declarationData.totalIncome, 'totalIncome')}
            <td className="text-center">21</td>
            <td className="font-bold">કુલ</td>
            {renderAutoCell(formData.declarationData.totalDeduction, 'totalDeduction')}
          </tr>
        </tbody>
      </table>

      {/* Signature Section - Editable Paragraph Format */}
      <div className="mt-30 pt-20 text-[11px] leading-relaxed">
        <div className="flex justify-between">
          <div className="text-left">
            {readOnly ? (
              <p className="font-bold mb-4">{formData.declarationData.employeeSignatureLabel || 'કર્મચારીની સહી'}</p>
            ) : (
              <input
                type="text"
                defaultValue={formData.declarationData.employeeSignatureLabel || 'કર્મચારીની સહી'}
                onBlur={(e) => updateTextField('employeeSignatureLabel', e.target.value)}
                className="font-bold mb-4 border-b border-dashed border-gray-400 bg-yellow-50 px-1 focus:outline-none focus:bg-yellow-100 print:bg-transparent print:border-0"
              />
            )}
            <p className="mb-1">
              {readOnly ? (
                <span>{formData.declarationData.designationLabel || 'હોદ્દો'}: {client.designationGujarati || client.designation || 'શિક્ષક'}</span>
              ) : (
                <>
                  <input
                    type="text"
                    defaultValue={formData.declarationData.designationLabel || 'હોદ્દો'}
                    onBlur={(e) => updateTextField('designationLabel', e.target.value)}
                    className="border-b border-dashed border-gray-400 bg-yellow-50 px-1 w-16 focus:outline-none focus:bg-yellow-100 print:bg-transparent print:border-0"
                  />
                  : {client.designationGujarati || client.designation || 'શિક્ષક'}
                </>
              )}
            </p>
            <p className="mb-1">
              {readOnly ? (
                <span>{formData.declarationData.placeLabel || 'સ્થળ'}: {client.schoolNameGujarati || client.schoolName || '-'}</span>
              ) : (
                <>
                  <input
                    type="text"
                    defaultValue={formData.declarationData.placeLabel || 'સ્થળ'}
                    onBlur={(e) => updateTextField('placeLabel', e.target.value)}
                    className="border-b border-dashed border-gray-400 bg-yellow-50 px-1 w-12 focus:outline-none focus:bg-yellow-100 print:bg-transparent print:border-0"
                  />
                  : {client.schoolNameGujarati || client.schoolName || '-'}
                </>
              )}
            </p>
            <p>તારીખ: _______________</p>
          </div>
          <div className="text-right">
            {readOnly ? (
              <p className="font-bold mb-4">{formData.declarationData.institutionHeadLabel || 'સંસ્થાના વડાની સહી'}</p>
            ) : (
              <input
                type="text"
                defaultValue={formData.declarationData.institutionHeadLabel || 'સંસ્થાના વડાની સહી'}
                onBlur={(e) => updateTextField('institutionHeadLabel', e.target.value)}
                className="font-bold mb-4 border-b border-dashed border-gray-400 bg-yellow-50 px-1 text-right focus:outline-none focus:bg-yellow-100 print:bg-transparent print:border-0"
              />
            )}
            <p className="mb-1">
              {readOnly ? (
                <span>{formData.declarationData.stampLabel || 'સિક્કો'}</span>
              ) : (
                <input
                  type="text"
                  defaultValue={formData.declarationData.stampLabel || 'સિક્કો'}
                  onBlur={(e) => updateTextField('stampLabel', e.target.value)}
                  className="border-b border-dashed border-gray-400 bg-yellow-50 px-1 w-16 text-right focus:outline-none focus:bg-yellow-100 print:bg-transparent print:border-0"
                />
              )}
            </p>
            <p>તારીખ: _______________</p>
          </div>
        </div>
      </div>

      <div className="form-footer text-center text-[8px] mt-8 pt-2 border-t border-dashed border-gray-400">
        Created By: Smart Computer Vinchhiya 9924640689, 9574031243
      </div>
    </div>
  );
};

export default DeclarationForm;