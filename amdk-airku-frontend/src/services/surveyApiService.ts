import { supabase } from '../lib/supabaseClient';
import { SurveyResponse } from '../types';

const mapToSurvey = (data: any): SurveyResponse => ({
    id: data.id,
    salesPersonId: data.sales_person_id,
    surveyDate: data.survey_date,
    storeName: data.store_name,
    storeAddress: data.store_address,
    storePhone: data.store_phone,
    mostSoughtProducts: data.most_sought_products || [],
    popularAirkuVariants: data.popular_airku_variants || [],
    competitorPrices: data.competitor_prices || [],
    competitorVolumes: data.competitor_volumes || [],
    feedback: data.feedback,
    proofOfSurveyImage: data.proof_of_survey_image
});

const mapToDb = (data: Partial<SurveyResponse>) => {
    const dbData: any = { ...data };
    if (data.salesPersonId !== undefined) dbData.sales_person_id = data.salesPersonId;
    if (data.surveyDate !== undefined) dbData.survey_date = data.surveyDate;
    if (data.storeName !== undefined) dbData.store_name = data.storeName;
    if (data.storeAddress !== undefined) dbData.store_address = data.storeAddress;
    if (data.storePhone !== undefined) dbData.store_phone = data.storePhone;
    if (data.mostSoughtProducts !== undefined) dbData.most_sought_products = data.mostSoughtProducts;
    if (data.popularAirkuVariants !== undefined) dbData.popular_airku_variants = data.popularAirkuVariants;
    if (data.competitorPrices !== undefined) dbData.competitor_prices = data.competitorPrices;
    if (data.competitorVolumes !== undefined) dbData.competitor_volumes = data.competitorVolumes;
    if (data.proofOfSurveyImage !== undefined) dbData.proof_of_survey_image = data.proofOfSurveyImage;

    // Cleanup camelCase
    delete dbData.salesPersonId;
    delete dbData.surveyDate;
    delete dbData.storeName;
    delete dbData.storeAddress;
    delete dbData.storePhone;
    delete dbData.mostSoughtProducts;
    delete dbData.popularAirkuVariants;
    delete dbData.competitorPrices;
    delete dbData.competitorVolumes;
    delete dbData.proofOfSurveyImage;

    return dbData;
};

export const getSurveys = async (): Promise<SurveyResponse[]> => {
    const { data, error } = await supabase.from('survey_responses').select('*');
    if (error) throw new Error(error.message);
    return (data || []).map(mapToSurvey);
};

export const createSurvey = async (surveyData: Omit<SurveyResponse, 'id' | 'salesPersonId'>): Promise<SurveyResponse> => {
    // Requires Auth user context for sales_person_id
    const user = await supabase.auth.getUser();
    const dbPayload = mapToDb({
        ...surveyData,
        salesPersonId: user.data.user?.id
    });

    const { data, error } = await supabase.from('survey_responses').insert(dbPayload).select().single();
    if (error) throw new Error(error.message);
    return mapToSurvey(data);
};