export interface Goal {
  id: number;
  name: string;
  target_amount: number;
}

let goals: Goal[] = [];
let nextId = 1;

export const getGoals = async (): Promise<Goal[]> => goals;

export const createGoal = async (name: string, targetAmount: number): Promise<number> => {
  const id = nextId;
  nextId += 1;
  goals = [...goals, { id, name, target_amount: targetAmount }];
  return id;
};

export const deleteGoal = async (id: number): Promise<void> => {
  goals = goals.filter((goal) => goal.id !== id);
};
