import { FastifyRequest, FastifyReply } from 'fastify'
import * as vacationService from '../modules/vacations/vacations.service';


export const list = async (req: Request, res: Response) => {
    try {
        const professionalId = req.query.professionalId as string;
        
        if (!professionalId) {
            return res.status(400).json({ error: 'Professional ID is required to list vacations' });
        }

        const vacations = await vacationService.listByProfessional(professionalId);
        return res.json(vacations);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const vacation = await vacationService.getById(id);
        if (!vacation) return res.status(404).json({ error: 'Vacation not found' });
        return res.json(vacation);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const newVacation = await vacationService.create(req.body);
        return res.status(201).json(newVacation);
    } catch (error) {
        return res.status(400).json({ error: 'Could not create vacation' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedVacation = await vacationService.update(id, req.body);
        return res.json(updatedVacation);
    } catch (error) {
        return res.status(400).json({ error: 'Could not update vacation' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await vacationService.remove(id);
        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({ error: 'Could not delete vacation' });
    }
};