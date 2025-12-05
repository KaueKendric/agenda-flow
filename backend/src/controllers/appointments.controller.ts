import { Request, Response } from 'express';
import * as appointmentService from '../services/appointments.service';


export const list = async (req: Request, res: Response) => {
    try {
        // Extração dos filtros da URL 
        const filters = {
            professionalId: req.query.professionalId as string,
            clientId: req.query.clientId as string,
            startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        };

        const appointments = await appointmentService.list(filters);
        return res.json(appointments);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const appointment = await appointmentService.getById(id);
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
        return res.json(appointment);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const newAppointment = await appointmentService.create(req.body);
        return res.status(201).json(newAppointment);
    } catch (error) {
        return res.status(400).json({ error: 'Could not create appointment', details: error });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedAppointment = await appointmentService.update(id, req.body);
        return res.json(updatedAppointment);
    } catch (error) {
        return res.status(400).json({ error: 'Could not update appointment' });
    }
};

// Endpoint específico para atualizar status 
export const updateStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) return res.status(400).json({ error: 'Status is required' });

        const updatedAppointment = await appointmentService.updateStatus(id, status);
        return res.json(updatedAppointment);
    } catch (error) {
        return res.status(400).json({ error: 'Could not update appointment status' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await appointmentService.remove(id);
        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({ error: 'Could not delete appointment' });
    }
};