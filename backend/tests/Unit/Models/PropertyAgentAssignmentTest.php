<?php

namespace Tests\Unit\Models;

use App\Models\Agent;
use App\Models\Property;
use App\Models\PropertyAgentAssignment;
use Tests\TestCase;

class PropertyAgentAssignmentTest extends TestCase
{
    public function test_property_agent_assignment_can_be_created()
    {
        $assignment = PropertyAgentAssignment::factory()->create();

        $this->assertDatabaseHas('property_agent_assignments', [
            'property_id' => $assignment->property_id,
            'agent_id' => $assignment->agent_id,
        ]);
    }

    public function test_property_agent_assignment_belongs_to_property()
    {
        $assignment = PropertyAgentAssignment::factory()->create();

        $this->assertInstanceOf(Property::class, $assignment->property);
        $this->assertEquals($assignment->property_id, $assignment->property->id);
    }

    public function test_property_agent_assignment_belongs_to_agent()
    {
        $assignment = PropertyAgentAssignment::factory()->create();

        $this->assertInstanceOf(Agent::class, $assignment->agent);
        $this->assertEquals($assignment->agent_id, $assignment->agent->id);
    }

    public function test_property_has_many_agents_through_assignments()
    {
        $property = Property::factory()->create();
        $agent1 = Agent::factory()->create();
        $agent2 = Agent::factory()->create();

        PropertyAgentAssignment::factory()->create([
            'property_id' => $property->id,
            'agent_id' => $agent1->id,
        ]);

        PropertyAgentAssignment::factory()->create([
            'property_id' => $property->id,
            'agent_id' => $agent2->id,
        ]);

        $property->refresh();

        $this->assertCount(2, $property->agents);
        $this->assertTrue($property->agents->contains($agent1));
        $this->assertTrue($property->agents->contains($agent2));
    }

    public function test_agent_has_many_properties_through_assignments()
    {
        $agent = Agent::factory()->create();
        $property1 = Property::factory()->create();
        $property2 = Property::factory()->create();

        $agent->propertyAssignments()->create([
            'property_id' => $property1->id,
        ]);

        $agent->propertyAssignments()->create([
            'property_id' => $property2->id,
        ]);

        $agent->refresh();

        $this->assertCount(2, $agent->propertyAssignments);
        $this->assertTrue($agent->propertyAssignments->contains('property_id', $property1->id));
        $this->assertTrue($agent->propertyAssignments->contains('property_id', $property2->id));
    }
}
