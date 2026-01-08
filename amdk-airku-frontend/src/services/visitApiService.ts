import { supabase } from '../lib/supabaseClient';
import { Visit, VisitStatus } from '../types';

// Map Logic: Joins sales_visit_route_stops + sales_visit_route_plans => Visit
const mapToVisit = (stop: any): Visit => ({
    id: stop.id,
    storeId: stop.store_id,
    salesPersonId: stop.plan?.sales_person_id,
    visitDate: stop.plan?.date,
    purpose: stop.purpose,
    status: stop.status,
    notes: stop.notes,
    proofOfVisitImage: stop.proof_of_visit_image
});

export const getVisits = async (): Promise<Visit[]> => {
    // Fetch Stops joined with Plans
    // supabase join syntax: stops!inner(..., plan:sales_visit_route_plans!inner(...))
    const { data, error } = await supabase
        .from('sales_visit_route_stops')
        .select(`
            *,
            plan:route_id (
                sales_person_id,
                date
            )
        `);

    if (error) throw new Error(error.message);
    return (data || []).map(mapToVisit);
};

export const createVisit = async (visitData: Omit<Visit, 'id' | 'status'>): Promise<Visit> => {
    // 1. Ensure Route Plan exists for Date + SalesPerson
    const { data: existingPlans } = await supabase
        .from('sales_visit_route_plans')
        .select('id')
        .eq('sales_person_id', visitData.salesPersonId)
        .eq('date', visitData.visitDate);

    let planId = existingPlans && existingPlans.length > 0 ? existingPlans[0].id : null;

    if (!planId) {
        // Create new plan
        const { data: newPlan, error: planError } = await supabase
            .from('sales_visit_route_plans')
            .insert({
                sales_person_id: visitData.salesPersonId,
                date: visitData.visitDate
            })
            .select()
            .single();

        if (planError) throw new Error(planError.message);
        planId = newPlan.id;
    }

    // 2. Insert Stop
    const { data: stop, error: stopError } = await supabase
        .from('sales_visit_route_stops')
        .insert({
            route_id: planId,
            store_id: visitData.storeId,
            purpose: visitData.purpose,
            status: VisitStatus.UPCOMING,
            notes: visitData.notes
        })
        .select(`
            *,
            plan:route_id (sales_person_id, date)
        `)
        .single();

    if (stopError) throw new Error(stopError.message);
    return mapToVisit(stop);
};

export const updateVisit = async (payload: { id: string } & Partial<Omit<Visit, 'id'>>): Promise<Visit> => {
    // Check if we need to move the visit (Date or SalesPerson changed)
    const { id, ...updateData } = payload;

    // Fetch current stop to see if plan logic is needed
    // Simple approach: Update fields on Stop. If Date/Person changed, User might need to delete & recreate, 
    // OR we proactively handle it. For now, let's assume UI restricts major changes or we handle pure data updates.
    // CAUTION: 'visitDate' and 'salesPersonId' are on the PLAN, not the STOP.
    // If these change, we must move the stop to a different plan.

    if (updateData.visitDate || updateData.salesPersonId) {
        // Migration logic: Delete old, Create new
        // 1. Get old data to fill gaps
        const { data: oldStop } = await supabase
            .from('sales_visit_route_stops')
            .select('*, plan:route_id(sales_person_id, date)')
            .eq('id', id)
            .single();

        if (!oldStop) throw new Error("Visit not found");

        const oldVisit = mapToVisit(oldStop);
        const newVisitData = { ...oldVisit, ...updateData };

        // 2. Delete old
        await deleteVisit(id);

        // 3. Create new
        return createVisit(newVisitData);
    }

    // Standard update (status, purpose, notes)
    const dbPayload: any = {};
    if (updateData.purpose) dbPayload.purpose = updateData.purpose;
    if (updateData.status) dbPayload.status = updateData.status;
    if (updateData.notes) dbPayload.notes = updateData.notes;
    if (updateData.proofOfVisitImage) dbPayload.proof_of_visit_image = updateData.proofOfVisitImage;
    if (updateData.storeId) dbPayload.store_id = updateData.storeId;

    const { data, error } = await supabase
        .from('sales_visit_route_stops')
        .update(dbPayload)
        .eq('id', id)
        .select(`*, plan:route_id(sales_person_id, date)`)
        .single();

    if (error) throw new Error(error.message);
    return mapToVisit(data);
};

export const deleteVisit = async (visitId: string): Promise<void> => {
    const { error } = await supabase.from('sales_visit_route_stops').delete().eq('id', visitId);
    if (error) throw new Error(error.message);
};