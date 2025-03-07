import { Pipe, PipeTransform } from '@angular/core';
import { SimStatus } from '../models/sim.model';

@Pipe({
  name: 'suspendedSimsCount'
})
export class SuspendedSimsCountPipe implements PipeTransform {
  // Este método se llama cada vez que se usa el pipe en el template
  transform(sims: SimStatus[]): number {
    // Filtra las SIMs con estado 'Suspendido' y cuenta cuántas hay
    return sims.filter(sim => sim.status === 'Suspendido').length;
  }
}
